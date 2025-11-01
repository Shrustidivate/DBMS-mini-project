const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    // Get orders
    const [orders] = await pool.query(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [req.userId]);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(`
          SELECT 
            oi.*,
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.image as product_image,
            p.category as product_category
          FROM order_items oi
          INNER JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);

        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product_id,
              name: item.product_name,
              description: item.product_description,
              image: item.product_image,
              category: item.product_category,
              price: item.price
            }
          }))
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Create order (checkout)
router.post('/', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { items } = req.body; // [{productId, quantity, price}]

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.userId, totalAmount, 'pending']
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of items) {
      // Check stock
      const [products] = await connection.query(
        'SELECT stock FROM products WHERE id = ?',
        [item.productId]
      );

      if (products.length === 0 || products[0].stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      // Insert order item
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Clear user's cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.userId]);

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  } finally {
    connection.release();
  }
});

module.exports = router;
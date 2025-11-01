const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const [cartItems] = await pool.query(`
      SELECT 
        c.*,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image as product_image,
        p.category as product_category,
        p.stock as product_stock
      FROM cart c
      INNER JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.userId]);

    // Format response
    const formattedCart = cartItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      userId: item.user_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.product_name,
        description: item.product_description,
        price: item.product_price,
        image: item.product_image,
        category: item.product_category,
        stock: item.product_stock
      }
    }));

    res.json(formattedCart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const [products] = await pool.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      res.json({ message: 'Cart updated', id: existing[0].id });
    } else {
      // Add new item
      const [result] = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.userId, productId, quantity]
      );
      res.status(201).json({ message: 'Added to cart', id: result.insertId });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    // Verify cart item belongs to user
    const [cartItems] = await pool.query(
      'SELECT product_id FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check stock
    const [products] = await pool.query(
      'SELECT stock FROM products WHERE id = ?',
      [cartItems[0].product_id]
    );

    if (products[0].stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update quantity
    await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, req.params.id]
    );

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

module.exports = router;
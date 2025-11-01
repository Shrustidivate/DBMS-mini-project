# Backend Code - Node.js + Express + MySQL

## Project Structure
```
backend/
├── server.js
├── package.json
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   └── orders.js
└── .env
```

## 1. package.json
```json
{
  "name": "shopping-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 2. .env
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=shopping_db
JWT_SECRET=your_jwt_secret_key_here
```

## 3. config/db.js
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

## 4. middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
```

## 5. routes/auth.js
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const userId = result.insertId;

    // Generate token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: userId, email, name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Validate token
router.get('/validate', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ message: 'Validation failed' });
  }
});

module.exports = router;
```

## 6. routes/products.js
```javascript
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE stock > 0 ORDER BY id DESC'
    );
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

module.exports = router;
```

## 7. routes/cart.js
```javascript
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
```

## 8. routes/orders.js
```javascript
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
```

## 9. server.js
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 10. MySQL Database Schema

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS shopping_db;
USE shopping_db;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  category VARCHAR(100),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sample products (optional)
INSERT INTO products (name, description, price, image, category, stock) VALUES
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'Electronics', 50),
('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'Electronics', 30),
('Laptop Backpack', 'Durable laptop backpack with multiple compartments', 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'Accessories', 100),
('USB-C Cable', 'Fast charging USB-C cable - 6ft', 14.99, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 'Accessories', 200);
```

## Setup Instructions

1. **Install MySQL** and create the database using the schema above

2. **Create backend folder** and add all files

3. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Configure .env** with your database credentials

5. **Run the server:**
   ```bash
   npm run dev
   ```

6. **Update frontend API_URL** in:
   - `src/contexts/AuthContext.tsx`
   - `src/pages/Home.tsx`
   - `src/pages/Cart.tsx`
   - `src/pages/Orders.tsx`

Replace `http://localhost:5000/api` with your actual backend URL.

## Testing the API

Test with curl or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get products
curl http://localhost:5000/api/products
```

This backend code provides:
✅ JWT authentication
✅ MySQL database integration
✅ Cart management with protected routes
✅ Order creation with transaction support
✅ Stock management
✅ Clean error handling

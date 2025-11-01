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
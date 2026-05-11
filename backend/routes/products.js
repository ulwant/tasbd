const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyAdmin } = require('../middleware/auth');

// ===== GET Routes (Specific first, then Generic) =====

// GET all products (exclude soft deleted)
router.get('/', async (req, res) => {
  try {
    const { category_id, search } = req.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY p.name';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all products with active discounts (admin only) - SPECIFIC ROUTE
router.get('/admin/discounts', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, price, discount_type, discount_value, category_id
       FROM products 
       WHERE deleted_at IS NULL AND discount_type != 'none'
       ORDER BY name`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET deleted products (trash) - SPECIFIC ROUTE
router.get('/trash/list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.deleted_at IS NOT NULL
       ORDER BY p.deleted_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product (exclude soft deleted) - GENERIC ROUTE (last GET)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.deleted_at IS NULL',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== POST Routes =====

// POST create product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Nama dan harga produk wajib diisi' });
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)',
      [name, price, stock || 0, category_id || null]
    );
    res.status(201).json({ id: result.insertId, name, price, stock: stock || 0, category_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PUT Routes (Specific paths before generic :id) =====

// PUT update product discount (admin only) - SPECIFIC ROUTE
router.put('/:id/discount', verifyAdmin, async (req, res) => {
  try {
    const { discount_type, discount_value } = req.body;
    
    if (!['none', 'percent', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Invalid discount type' });
    }
    
    if (discount_type === 'percent' && (discount_value < 0 || discount_value > 100)) {
      return res.status(400).json({ error: 'Discount percent must be between 0 and 100' });
    }
    
    if (discount_type === 'fixed' && discount_value < 0) {
      return res.status(400).json({ error: 'Discount value cannot be negative' });
    }

    const [result] = await pool.query(
      'UPDATE products SET discount_type = ?, discount_value = ? WHERE id = ? AND deleted_at IS NULL',
      [discount_type, discount_value || 0, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    res.json({ message: 'Diskon produk berhasil diperbarui', id: parseInt(req.params.id), discount_type, discount_value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT restore product from trash - SPECIFIC ROUTE
router.put('/:id/restore', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE products SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di trash' });
    }
    res.json({ message: 'Produk berhasil dipulihkan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product - GENERIC ROUTE
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    await pool.query(
      'UPDATE products SET name = ?, price = ?, stock = ?, category_id = ? WHERE id = ? AND deleted_at IS NULL',
      [name, price, stock, category_id || null, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), name, price, stock, category_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DELETE Routes (Specific paths before generic :id) =====

// DELETE product permanently (hard delete) - SPECIFIC ROUTE
router.delete('/:id/permanent', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ? AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di trash' });
    }
    res.json({ message: 'Produk berhasil dihapus permanen' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product (soft delete) - GENERIC ROUTE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan atau sudah dihapus' });
    }
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAdmin } = require('../middleware/auth');

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
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }
    query += ' ORDER BY p.name';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product (exclude soft deleted)
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND p.deleted_at IS NULL',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Nama dan harga produk wajib diisi' });
    }
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, category_id) VALUES ($1, $2, $3, $4) RETURNING id, name, price, stock, category_id',
      [name, price, stock || 0, category_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product
router.put('/:id(\\d+)', async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3, category_id = $4, updated_at = NOW() WHERE id = $5 AND deleted_at IS NULL',
      [name, price, stock, category_id || null, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), name, price, stock, category_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product — soft delete
router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan atau sudah dihapus' });
    }
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET deleted products (trash)
router.get('/trash/list', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
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

// PUT restore product from trash
router.put('/:id(\\d+)/restore', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE products SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di trash' });
    }
    res.json({ message: 'Produk berhasil dipulihkan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product permanently (hard delete)
router.delete('/:id(\\d+)/permanent', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di trash' });
    }
    res.json({ message: 'Produk berhasil dihapus permanen' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT set product discount (admin only)
router.put('/:id(\\d+)/discount', requireAdmin, async (req, res) => {
  try {
    const { discount_type, discount_value } = req.body;
    
    // Validate discount_type
    if (!['none', 'percent', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Tipe diskon harus none, percent, atau fixed' });
    }
    
    // Validate discount_value
    if (discount_value === undefined || discount_value === null) {
      return res.status(400).json({ error: 'Nilai diskon wajib diisi' });
    }
    
    const value = parseFloat(discount_value);
    if (isNaN(value) || value < 0) {
      return res.status(400).json({ error: 'Nilai diskon harus >= 0' });
    }
    
    // Validate percentage range
    if (discount_type === 'percent' && value > 100) {
      return res.status(400).json({ error: 'Diskon persentase maksimal 100%' });
    }
    
    const result = await pool.query(
      'UPDATE products SET discount_type = $1, discount_value = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [discount_type, value, req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET products with discounts (admin only)
router.get('/admin/discounts', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.deleted_at IS NULL AND p.discount_type != 'none'
       ORDER BY p.name`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

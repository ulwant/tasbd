const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all categories (exclude soft deleted)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id, name', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update category
router.put('/:id(\\d+)', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND deleted_at IS NULL',
      [name, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category — soft delete
router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE categories SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan atau sudah dihapus' });
    }
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET deleted categories (trash)
router.get('/trash/list', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT restore category from trash
router.put('/:id(\\d+)/restore', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE categories SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan di trash' });
    }
    res.json({ message: 'Kategori berhasil dipulihkan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category permanently (hard delete)
router.delete('/:id(\\d+)/permanent', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND deleted_at IS NOT NULL',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan di trash' });
    }
    res.json({ message: 'Kategori berhasil dihapus permanen' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

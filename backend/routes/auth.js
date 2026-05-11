const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'cashier' } = req.body;
    const userRole = role === 'admin' ? 'admin' : 'cashier';

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query('INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)', [
      username,
      email,
      hashedPassword,
      userRole
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const users = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE username = $1',
      [username]
    );
    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token (valid for 24 hours)
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current account
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// Admin: list users and roles
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil daftar user' });
  }
});

// Admin: update user role
router.put('/users/:id(\\d+)/role', verifyToken, requireAdmin, async (req, res) => {
  try {
    const role = req.body.role === 'admin' ? 'admin' : 'cashier';
    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role, created_at',
      [role, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah role user' });
  }
});

module.exports = router;

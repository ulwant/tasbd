const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Generate invoice number
function generateInvoice() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV${y}${m}${d}${h}${min}${s}${rand}`;
}

// POST create transaction
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, payment_amount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong' });
    }

    // Calculate total with discounts
    let total_amount = 0;
    const itemsWithDiscount = [];
    
    for (const item of items) {
      // Get product discount info from database
      const productResult = await client.query(
        'SELECT discount_type, discount_value FROM products WHERE id = $1',
        [item.product_id]
      );
      
      let itemTotal = item.price * item.quantity;
      let discountAmount = 0;
      
      if (productResult.rows.length > 0) {
        const product = productResult.rows[0];
        
        if (product.discount_type === 'percent') {
          discountAmount = (product.discount_value / 100) * itemTotal;
        } else if (product.discount_type === 'fixed') {
          discountAmount = product.discount_value * item.quantity;
        }
      }
      
      const finalItemTotal = itemTotal - discountAmount;
      total_amount += finalItemTotal;
      
      itemsWithDiscount.push({
        ...item,
        discount_amount: discountAmount,
        final_total: finalItemTotal
      });
    }

    if (payment_amount < total_amount) {
      return res.status(400).json({ error: 'Pembayaran kurang' });
    }

    const change_amount = payment_amount - total_amount;
    const invoice_number = generateInvoice();

    await client.query('BEGIN');

    // Insert transaction
    const txResult = await client.query(
      'INSERT INTO transactions (user_id, invoice_number, total_amount, payment_amount, change_amount) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, invoice_number, total_amount, payment_amount, change_amount]
    );
    const transactionId = txResult.rows[0].id;

    // Insert items & update stock
    for (const item of itemsWithDiscount) {
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [transactionId, item.product_id, item.product_name, item.price, item.quantity, item.final_total]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: transactionId,
      invoice_number,
      total_amount,
      payment_amount,
      change_amount,
      cashier: req.user.username,
      items: itemsWithDiscount,
      created_at: new Date()
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET all transactions (with optional date filter)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT t.*, COALESCE(u.username, 'Tidak tercatat') AS cashier_name, u.email AS cashier_email
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
    `;
    let params = [];

    if (date) {
      query += ' WHERE DATE(t.created_at) = $1';
      params.push(date);
    }

    query += ' ORDER BY t.created_at DESC';
    const { rows } = await pool.query(query, params);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single transaction with items
router.get('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const txRows = await pool.query(
      `SELECT t.*, COALESCE(u.username, 'Tidak tercatat') AS cashier_name, u.email AS cashier_email
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (txRows.rows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    const items = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = $1', [req.params.id]);
    res.json({ ...txRows.rows[0], items: items.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

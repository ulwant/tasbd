const express = require('express');
const router = express.Router();
const pool = require('../db');

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
  const conn = await pool.getConnection();
  try {
    const { items, payment_amount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong' });
    }

    // Get product details including discounts
    let total_amount = 0;
    const itemsWithDiscount = [];
    
    for (const item of items) {
      const [productRows] = await conn.query(
        'SELECT price, discount_type, discount_value FROM products WHERE id = ? AND deleted_at IS NULL',
        [item.product_id]
      );
      
      if (productRows.length === 0) {
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
      }
      
      const product = productRows[0];
      let discountAmount = 0;
      
      // Calculate discount
      if (product.discount_type === 'percent') {
        discountAmount = (product.price * product.discount_value) / 100;
      } else if (product.discount_type === 'fixed') {
        discountAmount = product.discount_value;
      }
      
      const finalPrice = Math.max(0, product.price - discountAmount);
      const subtotal = finalPrice * item.quantity;
      total_amount += subtotal;
      
      itemsWithDiscount.push({
        ...item,
        final_price: finalPrice,
        discount_amount: discountAmount,
        subtotal: subtotal
      });
    }
    
    if (payment_amount < total_amount) {
      return res.status(400).json({ error: 'Pembayaran kurang' });
    }

    const change_amount = payment_amount - total_amount;
    const invoice_number = generateInvoice();

    await conn.beginTransaction();

    // Insert transaction
    const [txResult] = await conn.query(
      'INSERT INTO transactions (invoice_number, total_amount, payment_amount, change_amount) VALUES (?, ?, ?, ?)',
      [invoice_number, total_amount, payment_amount, change_amount]
    );
    const transactionId = txResult.insertId;

    // Insert items & update stock
    for (const item of itemsWithDiscount) {
      await conn.query(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [transactionId, item.product_id, item.product_name, item.final_price, item.quantity, item.subtotal]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: transactionId,
      invoice_number,
      total_amount,
      payment_amount,
      change_amount,
      items: itemsWithDiscount,
      created_at: new Date()
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// GET all transactions (with optional date filter)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM transactions';
    let params = [];

    if (date) {
      query += ' WHERE DATE(created_at) = ?';
      params.push(date);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single transaction with items
router.get('/:id', async (req, res) => {
  try {
    const [txRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (txRows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    const [items] = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [req.params.id]);
    res.json({ ...txRows[0], items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

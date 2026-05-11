const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auto-create database and tables
async function initDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  };

  // Gunakan SSL jika terhubung ke cloud database (seperti Aiven)
  if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  const connection = await mysql.createConnection(dbConfig);

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'kasir_nuril'}\``);
  await connection.query(`USE \`${process.env.DB_NAME || 'kasir_nuril'}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'cashier') DEFAULT 'cashier',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      category_id INT,
      discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
      discount_value DECIMAL(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL,
      total_amount DECIMAL(12,2) NOT NULL,
      payment_amount DECIMAL(12,2) NOT NULL,
      change_amount DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      quantity INT NOT NULL,
      subtotal DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    )
  `);

  await connection.end();
  console.log('✅ Database & tables initialized successfully');
}

// Routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const { verifyToken } = require('./middleware/auth');

// Public auth routes (no token required)
app.use('/api/auth', authRouter);

// Protected routes (token required)
app.use('/api/products', verifyToken, productsRouter);
app.use('/api/categories', verifyToken, categoriesRouter);
app.use('/api/transactions', verifyToken, transactionsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'KasirNuril API is running' });
});

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });

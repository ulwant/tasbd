const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Add your Neon connection string to the environment.');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

let initPromise;

async function initDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price NUMERIC(12,2) NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ NULL,
          discount_type VARCHAR(20) DEFAULT 'none' CHECK (discount_type IN ('none', 'percent', 'fixed')),
          discount_value NUMERIC(12,2) DEFAULT 0
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          invoice_number VARCHAR(50) NOT NULL,
          total_amount NUMERIC(12,2) NOT NULL,
          payment_amount NUMERIC(12,2) NOT NULL,
          change_amount NUMERIC(12,2) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transaction_items (
          id SERIAL PRIMARY KEY,
          transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id),
          product_name VARCHAR(255) NOT NULL,
          price NUMERIC(12,2) NOT NULL,
          quantity INTEGER NOT NULL,
          subtotal NUMERIC(12,2) NOT NULL
        )
      `);

      await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL');
      await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()');
      await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL');
      await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT \'none\' CHECK (discount_type IN (\'none\', \'percent\', \'fixed\'))');
      await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12,2) DEFAULT 0');
      await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
    })();
  }

  return initPromise;
}

module.exports = { pool, initDatabase };

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const { verifyToken } = require('./middleware/auth');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/products', verifyToken, productsRouter);
app.use('/api/categories', verifyToken, categoriesRouter);
app.use('/api/transactions', verifyToken, transactionsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'KasirNuril API is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

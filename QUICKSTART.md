# 🚀 Quick Start Guide - KasirNuril POS System

## Prerequisites
- Node.js v14+ installed
- Backend `.env` file sudah ada dengan Neon credentials
- Frontend `.env` file sudah ada

---

## Backend Setup (PostgreSQL Neon)

### 1. Update Dependencies (MySQL → PostgreSQL)

```bash
cd backend
npm uninstall mysql2
npm install pg
npm install
```

### 2. Replace Database Driver

Berikut file yang perlu di-update:

#### A. Update `backend/db.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false  // Required for Neon
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
```

#### B. Update `backend/server.js` - Replace with this:

```javascript
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL database');
    
    // Run database schema initialization
    const fs = require('fs');
    const schema = fs.readFileSync('./database.sql', 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith('--')) {
        try {
          await client.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.error('SQL Error:', err.message);
          }
        }
      }
    }
    
    client.release();
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const { verifyToken } = require('./middleware/auth');

// Public auth routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/products', verifyToken, productsRouter);
app.use('/api/categories', verifyToken, categoriesRouter);
app.use('/api/transactions', verifyToken, transactionsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'KasirNuril API is running on Neon PostgreSQL' });
});

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
```

### 3. Update `backend/package.json`

```json
{
  "name": "kasir-nuril-backend",
  "version": "1.0.0",
  "description": "Backend API for KasirNuril POS",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### 4. Update All Route Files - Convert MySQL → PostgreSQL

**Key changes for ALL route files**:

| MySQL | PostgreSQL |
|-------|-----------|
| `const [data] = await pool.query(...)` | `const result = await pool.query(...)` |
| `data[0]` | `result.rows[0]` |
| `?` parameter | `$1, $2, $3` |
| `LIKE` | `ILIKE` |
| `.query()` returns array | `.query()` returns `{ rows, rowCount }` |

**Example Migration**:

**MySQL (BEFORE)**:
```javascript
const [products] = await pool.query(
  'SELECT * FROM products WHERE name LIKE ? AND deleted_at IS NULL',
  [`%${search}%`]
);
res.json(products);
```

**PostgreSQL (AFTER)**:
```javascript
const result = await pool.query(
  'SELECT * FROM products WHERE name ILIKE $1 AND deleted_at IS NULL',
  [`%${search}%`]
);
res.json(result.rows);
```

---

## Complete PostgreSQL Pattern for Routes

### GET All
```javascript
const result = await pool.query('SELECT * FROM table_name');
const data = result.rows;
```

### GET By ID
```javascript
const result = await pool.query('SELECT * FROM table_name WHERE id = $1', [id]);
const item = result.rows[0];
```

### POST (Insert)
```javascript
const result = await pool.query(
  'INSERT INTO table_name (col1, col2) VALUES ($1, $2) RETURNING *',
  [val1, val2]
);
const newItem = result.rows[0];
```

### PUT (Update)
```javascript
await pool.query(
  'UPDATE table_name SET col1 = $1, col2 = $2 WHERE id = $3',
  [val1, val2, id]
);
```

### DELETE (Soft)
```javascript
await pool.query(
  'UPDATE table_name SET deleted_at = NOW() WHERE id = $1',
  [id]
);
```

### DELETE (Hard)
```javascript
await pool.query('DELETE FROM table_name WHERE id = $1', [id]);
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Frontend akan auto-connect ke backend di `http://localhost:5000/api`

---

## Run Everything

### Terminal 1 - Backend
```bash
cd backend
npm start
```

Expected output:
```
✅ Connected to Neon PostgreSQL database
✅ Database schema initialized
🚀 Server running on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms
  ➜  Local:   http://localhost:5173/
```

### Terminal 3 - Test API (Optional)
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_user","password":"admin123"}'

# Should return JWT token
```

---

## Environment Variables

**Backend `.env`** (already configured):
- ✅ DB credentials from Neon
- ✅ PORT = 5000
- ✅ JWT_SECRET configured
- ✅ NODE_ENV = production

**Frontend `.env`** (already configured):
- ✅ VITE_API_BASE_URL = http://localhost:5000/api

---

## Troubleshooting

### Error: "Module pg not found"
```bash
npm install pg
```

### Error: "Database connection error"
- Check `.env` file - verify credentials
- Test connection: `psql "postgresql://..."`

### Error: "Table already exists"
- This is normal - tables are created only once
- Safe to ignore

### Error: "Cannot find module './database.sql'"
- Ensure `database.sql` is in backend root folder

### CORS Error
- Frontend is on `localhost:5173`
- Backend CORS already allows all origins
- Check network tab in browser DevTools

---

## File Structure Expected

```
d:\POS_TA_SBD\
├── backend/
│   ├── .env              (✅ Credentials configured)
│   ├── .env.example      (✅ Template)
│   ├── .gitignore        (✅ Excludes .env)
│   ├── db.js             (✅ Update to PostgreSQL)
│   ├── server.js         (✅ Update to PostgreSQL)
│   ├── package.json      (✅ Replace mysql2 → pg)
│   ├── database.sql      (✅ PostgreSQL schema)
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js       (✅ Already PostgreSQL ready)
│       ├── products.js   (⚠️ Update from MySQL)
│       ├── categories.js (⚠️ Update from MySQL)
│       └── transactions.js (⚠️ Update from MySQL)
├── frontend/
│   ├── .env              (✅ Configured)
│   ├── .env.example      (✅ Template)
│   ├── .gitignore        (✅ Excludes .env)
│   ├── package.json
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       └── pages/
│           └── LoginPage.jsx
├── database.sql          (✅ Ready to use)
├── REPORT.md             (✅ Requirements checklist)
├── ERD.md                (✅ Database schema)
├── NEON_SETUP.md         (✅ Detailed guide)
└── QUICKSTART.md         (This file)
```

---

## Summary - What to Update

1. ✅ Copy provided `.env` to `backend/.env`
2. ⚠️ Update `backend/db.js` → PostgreSQL Pool
3. ⚠️ Update `backend/server.js` → PostgreSQL connection
4. ⚠️ Update `backend/package.json` → Replace mysql2 with pg
5. ⚠️ Update all route files → PostgreSQL syntax
6. ✅ `npm install` in backend
7. ✅ `npm install` in frontend
8. ✅ `npm start` backend + `npm run dev` frontend

---

## Next Steps After Setup

1. Test login at `http://localhost:5173`
2. Create products and categories
3. Test search and filtering
4. Test transactions and sales reports
5. Push to GitHub when everything works

---

**Ready to roll! 🎉**

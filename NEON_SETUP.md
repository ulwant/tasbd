# Setup PostgreSQL Database on Neon.com

## Step-by-Step Guide untuk KasirNuril POS System

### Prerequisite
- Akun Neon.com (gratis)
- Backend project sudah terinstall

---

## 1. Create Neon Project

1. Buka [https://neon.tech](https://neon.tech) dan login/signup
2. Click **"Create a new project"**
3. Pilih PostgreSQL database
4. Beri nama project: `kasir-nuril` (atau sesuai keinginan)
5. Pilih region terdekat (Indonesia: Singapore atau Tokyo recommended)
6. Click **Create project**

---

## 2. Get Connection String

1. Setelah project dibuat, pergi ke **Connection Details**
2. Copy connection string (format: `postgres://user:password@host:port/dbname`)
3. Catat semua detail:
   - **Hostname**: `host`
   - **Port**: biasanya `5432`
   - **Database name**: `dbname`
   - **User**: `user`
   - **Password**: `password`

---

## 3. Update Backend .env File

Buat atau update file `.env` di folder `backend/`:

```env
# Database Configuration
DB_HOST=<neon-hostname>
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
DB_NAME=<neon-dbname>
DB_PORT=5432

# Server Configuration
PORT=5000

# JWT Secret (untuk auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Node Environment
NODE_ENV=production
```

**Example**:
```env
DB_HOST=ep-yellow-peak-123456.us-east-1.postgres.vercel-storage.com
DB_USER=default
DB_PASSWORD=abc123defghijk
DB_NAME=neondb
DB_PORT=5432
PORT=5000
JWT_SECRET=KasirNuril_JWT_Secret_2026_Change_This
NODE_ENV=production
```

---

## 4. Update Backend Code untuk PostgreSQL

### A. Update `backend/db.js`:

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

### B. Update `backend/package.json` - Replace mysql2 with pg:

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

### C. Update `backend/server.js`:

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

// Check database connection
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL database');
    
    // Run database initialization SQL
    const schema = require('fs').readFileSync('./database.sql', 'utf8');
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

---

## 5. Update Route Files untuk PostgreSQL

### Update `backend/routes/products.js`:

Replace mysql2 query syntax dengan PostgreSQL syntax. Example:

**MySQL (before)**:
```javascript
const [products] = await pool.query(
  'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.deleted_at IS NULL AND p.name LIKE ?',
  [`%${search}%`]
);
```

**PostgreSQL (after)**:
```javascript
const result = await pool.query(
  'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.deleted_at IS NULL AND p.name ILIKE $1 ORDER BY p.name',
  [`%${search}%`]
);
const products = result.rows;
```

**Key differences**:
- `?` → `$1, $2, $3` (numbered parameters)
- `.query()` returns `{ rows, rowCount }` instead of `[data]`
- Use `.rows` to get results
- `LIKE` → `ILIKE` (case-insensitive search)

### Pattern untuk semua routes:

```javascript
// Get all
const result = await pool.query('SELECT * FROM table_name');
const data = result.rows;

// Get by ID
const result = await pool.query('SELECT * FROM table_name WHERE id = $1', [id]);
const item = result.rows[0];

// Insert
const result = await pool.query(
  'INSERT INTO table_name (col1, col2) VALUES ($1, $2) RETURNING *',
  [val1, val2]
);
const newItem = result.rows[0];

// Update
await pool.query('UPDATE table_name SET col1 = $1 WHERE id = $2', [val1, id]);

// Delete (soft)
await pool.query('UPDATE table_name SET deleted_at = NOW() WHERE id = $1', [id]);

// Delete (hard)
await pool.query('DELETE FROM table_name WHERE id = $1', [id]);
```

---

## 6. Install Dependencies & Test

```bash
# Navigate to backend
cd backend

# Remove old MySQL dependencies
npm uninstall mysql2

# Install PostgreSQL client
npm install pg

# Install all dependencies
npm install

# Start server
npm start
```

Expected output:
```
✅ Connected to Neon PostgreSQL database
✅ Database schema initialized
🚀 Server running on http://localhost:5000
```

---

## 7. Run SQL Queries Manually (Optional)

Jika ingin menjalankan SQL langsung di Neon:

1. Buka Neon dashboard → **SQL Editor**
2. Paste content dari `database.sql`
3. Click **Execute**

Atau gunakan `psql` CLI:

```bash
psql "postgres://user:password@host:port/dbname" -f database.sql
```

---

## 8. Test Connection

Buka file `backend/routes/products.js` dan jalankan server:

```bash
npm start
```

Buka browser/Postman:
```
GET http://localhost:5000/
```

Harus melihat:
```json
{ "message": "KasirNuril API is running on Neon PostgreSQL" }
```

---

## 9. Frontend Configuration (Already Done)

File `frontend/src/api.js` sudah setup untuk menggunakan backend:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
```

Saat development, proxy otomatis ke `localhost:5000`. Saat production, set env variable:
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

## Troubleshooting

### Error: "FATAL: password authentication failed"
- **Solusi**: Check `.env` file - pastikan password benar, terutama special characters

### Error: "SSL required"
- **Solusi**: Neon memerlukan SSL. Pastikan `db.js` punya:
  ```javascript
  ssl: { rejectUnauthorized: false }
  ```

### Error: "Connection timeout"
- **Solusi**: 
  - Check internet connection
  - Verifikasi IP whitelist di Neon dashboard (biasanya auto)
  - Coba region yang berbeda

### Error: "Table already exists"
- **Solusi**: Aman diabaikan; schema hanya dibuat sekali

### Password characters seperti `@`, `!`, `$` tidak bekerja
- **Solusi**: URL-encode password:
  ```
  @  → %40
  !  → %21
  $  → %24
  #  → %23
  ```
  Contoh di `.env`:
  ```
  DB_PASSWORD=pass%40word123%21
  ```

---

## Complete Example .env

```env
# ============================================================================
# NEON DATABASE CONFIGURATION
# ============================================================================
DB_HOST=ep-green-meadow-a12345.us-west-2.postgres.vercel-storage.com
DB_USER=default
DB_PASSWORD=neon_password_here_12345
DB_NAME=neondb
DB_PORT=5432

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
PORT=5000
NODE_ENV=development

# ============================================================================
# JWT AUTHENTICATION
# ============================================================================
JWT_SECRET=KasirNuril_SuperSecret_JWT_Key_Change_In_Production_2026

# ============================================================================
# FRONTEND (if needed)
# ============================================================================
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Setup Neon project & get connection string
2. ✅ Update `.env` file
3. ✅ Update `db.js` untuk PostgreSQL
4. ✅ Update `package.json` (replace mysql2 → pg)
5. ✅ Update `server.js` untuk PostgreSQL connection
6. ✅ Update all route files dengan PostgreSQL syntax
7. ✅ `npm install && npm start`
8. ✅ Test connection
9. ✅ Deploy frontend & backend

---

**Selesai!** Database Anda sekarang terhubung dengan Neon PostgreSQL Cloud ☁️

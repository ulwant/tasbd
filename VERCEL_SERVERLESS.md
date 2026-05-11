# Deploy ke Vercel + Neon

Project ini sudah dikonversi supaya frontend Vite dan backend Express berjalan dalam satu deploy Vercel.

## Struktur

- `frontend/` tetap menjadi React/Vite app.
- `api/index.js` menjadi Vercel Serverless Function.
- `backend/server.js` mengekspor Express app, dan hanya menjalankan `listen()` saat dipakai lokal.
- `backend/db.js` memakai PostgreSQL `pg` dan membaca `DATABASE_URL` dari Neon.
- `vercel.json` mengarahkan `/api/*` ke serverless function dan route lain ke frontend.

## Environment Variables di Vercel

Tambahkan variable berikut di Vercel Project Settings:

```env
DATABASE_URL=postgresql://...neon...?sslmode=require
JWT_SECRET=isi-dengan-random-secret-yang-panjang
NODE_ENV=production
```

Jangan isi `VITE_API_BASE_URL` untuk deploy satu project di Vercel. Frontend akan memakai `/api` otomatis.

## Build Settings Vercel

Gunakan setting default dari repo root:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `frontend/dist`
- Install Command: default Vercel

## Local Development

Untuk backend lokal:

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Untuk frontend lokal:

```bash
cd frontend
npm install
npm run dev
```

Saat frontend lokal, `vite.config.js` masih mem-proxy `/api` ke `http://localhost:5000`.

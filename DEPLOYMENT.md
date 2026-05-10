# Panduan Deployment (Publikasi) KasirNuril

Karena aplikasi ini adalah aplikasi full-stack, Anda membutuhkan 3 komponen layanan (semuanya memiliki versi **Gratis**).

## 1. Database MySQL (Rekomendasi: Aiven atau Railway)
Karena MySQL tidak bisa di-hosting di GitHub, Anda perlu layanan Database.
1. Daftar di [Aiven.io](https://aiven.io/) atau [Railway.app](https://railway.app/).
2. Buat instance database MySQL gratis.
3. Setelah selesai, Anda akan mendapatkan kredensial:
   - Host (contoh: `mysql-kasirnuril.aivencloud.com`)
   - Port (contoh: `12345`)
   - User (contoh: `avnadmin`)
   - Password
   - Database Name (contoh: `defaultdb`)

## 2. Backend API (Rekomendasi: Render.com)
Backend Node.js tidak bisa ditaruh di Vercel/GitHub Pages, melainkan di [Render](https://render.com/).
1. Daftar ke [Render.com](https://render.com/) pakai akun GitHub Anda.
2. Buat **New Web Service** -> Hubungkan GitHub Repositori `kasir-nuril-pos` Anda.
3. Konfigurasi:
   - **Root Directory**: `backend` *(Sangat Penting!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Buka menu **Environment Variables** di Render dan masukkan data dari layanan Database Anda tadi:
   - `DB_HOST` = (Host dari Aiven/Railway)
   - `DB_USER` = (User database)
   - `DB_PASSWORD` = (Password database)
   - `DB_NAME` = (Nama database)
   - `DB_PORT` = (Port database)
5. Klik **Create Web Service**. Tunggu hingga deploy selesai dan Anda akan mendapat URL seperti: `https://kasir-nuril-api.onrender.com`.

## 3. Frontend UI (Rekomendasi: Vercel)
Antarmuka pengguna akan kita hosting di Vercel.
1. Daftar ke [Vercel.com](https://vercel.com/) pakai akun GitHub Anda.
2. Tambahkan **New Project** -> Import GitHub Repositori `kasir-nuril-pos` Anda.
3. Konfigurasi:
   - **Framework Preset**: Pilih `Vite`
   - **Root Directory**: Ubah ke `frontend` *(Sangat Penting!)*
   - Buka menu **Environment Variables**, tambahkan:
     - Name: `VITE_API_BASE_URL`
     - Value: `https://kasir-nuril-api.onrender.com/api` *(Ganti link ini dengan URL Backend Render Anda dari Langkah 2)*
4. Klik **Deploy** dan tunggu hingga berhasil. Anda akan mendapatkan URL Vercel (contoh: `kasir-nuril.vercel.app`).

### Selesai! 🎉
Aplikasi Anda kini sudah sepenuhnya online:
- URL Frontend (Vercel) untuk diakses pengguna.
- URL Backend (Render) yang memproses transaksi secara tak kasat mata.
- URL Database (Aiven/Railway) sebagai tempat penyimpanan data aslinya.

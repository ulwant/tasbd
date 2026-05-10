# KasirNuril - Web-Based Point of Sale (POS) System

KasirNuril adalah aplikasi Point of Sale (Kasir) modern berbasisi web yang dirancang untuk mempermudah manajemen produk dan transaksi penjualan. Aplikasi ini menggunakan teknologi web terkini dengan tampilan UI bertema gelap (dark mode) yang premium dan navigasi yang responsif.

## 🚀 Fitur Utama

- **Manajemen Produk (CRUD):** Tambah, edit, hapus, dan lihat daftar produk dengan mudah.
- **Transaksi Penjualan:** Antarmuka kasir yang interaktif lengkap dengan fitur keranjang belanja (shopping cart).
- **Kalkulasi Otomatis:** Perhitungan total belanja otomatis berdasarkan item di keranjang.
- **Pembayaran:** Proses perhitungan bayar dan uang kembalian (change calculation).
- **Cetak Struk:** Fitur cetak struk/resi (receipt) setelah transaksi selesai.

## 💻 Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/) (dengan Vite)
- React Router DOM untuk navigasi
- React Icons
- React Hot Toast untuk notifikasi
- Vanilla CSS untuk styling fleksibel dan premium

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL2](https://www.mysql.com/) sebagai database relasional
- CORS & Dotenv

## 📋 Prasyarat

Pastikan perangkat Anda sudah terinstal:
- [Node.js](https://nodejs.org/en/download/) (versi 16 atau lebih baru)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (XAMPP / WAMP / native)

## 🛠️ Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal:

### 1. Persiapan Database
1. Buka MySQL client Anda (misal: phpMyAdmin, MySQL Workbench, atau terminal).
2. Buat database baru untuk aplikasi ini (misalkan `kasir_nuril_db`).
3. Import file SQL (jika ada) yang terdapat pada direktori database, atau set-up tabel menggunakan backend migration/script.

### 2. Setup Backend
1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend` dan sesuaikan kredensial database Anda:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kasir_nuril_db
   ```
4. Jalankan server backend (mode dev):
   ```bash
   npm run dev
   ```

### 3. Setup Frontend
1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan development server vite:
   ```bash
   npm run dev
   ```

## 📁 Struktur Direktori

```text
KasirNuril/
├── backend/            # Source code API Express.js & MySQL
├── frontend/           # Source code React.js (Vite)
│   ├── src/
│   │   ├── components/ # Rekomendasi UI Komponen yang dapat digunakan kembali
│   │   ├── pages/      # Halaman Utama (Main POS, Dashboard, dll)
│   │   ├── App.jsx     # Root komponen & Routing
│   │   └── index.css   # Styling sistem terpusat
├── mysql_data/         # Data spesifik MySQL / Skrip Database
└── README.md           # Dokumentasi Aplikasi
```

## 🎨 Desain dan Tampilan
Aplikasi dirancang dengan prioritas fungsional dan estetika tinggi. Kami menggunakan efek hover dinamis, layout yang responsif, serta pemilihan tipografi yang modern agar memberikan pengalaman penggunaan (*user experience*) terbaik saat proses operasional di titik kasir.

---
*Dibuat karena kebutuhan pribadi, tetapi jika anda ingin aplikasi serupa hubungi saya di [nurilhuda155@gmail.com].*

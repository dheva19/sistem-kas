# Website Manajemen Kas Organisasi / Kelas (MERN Stack - Serverless Vercel)

Aplikasi pencatatan kas berbasis MERN Stack yang dirancang siap deploy ke platform **Vercel Serverless**. Dilengkapi autentikasi admin, manajemen anggota, tracking pembayaran kas bulanan dengan QRIS/QR Code dinamis, pencatatan pengeluaran, dashboard ringkasan, dan ekspor data ke Excel / CSV.

---

## 🌟 Fitur Utama
1. **Autentikasi Admin (JWT)**:
   - Login admin terlindungi dengan JSON Web Token & enkripsi bcrypt.
   - Akun default otomatis dibuat jika database masih kosong (`admin` / `admin123`).
   - Fitur ganti password & ubah nama admin di halaman konfigurasi.
2. **Data Anggota (CRUD)**:
   - Pencatatan data anggota (Nama & Angkatan tahun, contoh: 2023, 2024).
   - Filter cepat berdasarkan tahun angkatan dan pencarian nama.
   - Status anggota (Aktif / Nonaktif).
3. **Tracking Kas Bulanan & QR Code Pembayaran**:
   - Filter kas per bulan dan tahun.
   - Tampilan status real-time: **Lunas** atau **Belum Bayar**.
   - Modal pembayaran kas dengan tampilan **Kode QR Dinamis** (QRIS/E-Wallet).
4. **Pencatatan Pengeluaran Kas**:
   - Catat setiap pengeluaran kas berdasarkan kategori (Operasional, Konsumsi, Acara, dll.).
   - Riwayat pengeluaran kas transparan dengan filter pencarian.
5. **Dashboard Ringkasan Finansial**:
   - Saldo Kas Bersih (Total Pemasukan - Total Pengeluaran).
   - Kas masuk & keluar bulan ini.
   - Persentase kepatuhan iuran kas anggota.
   - 5 riwayat transaksi kas masuk & keluar terakhir.
6. **Halaman Konfigurasi**:
   - Pengaturan nominal kas bulanan (misal: Rp 30.000 / bulan).
   - Unggah gambar QR Code pembayaran (disimpan langsung dalam database sebagai Base64, tidak memerlukan setup penyimpanan pihak ketiga seperti S3 atau Cloudinary).
   - Informasi catatan transfer (Bank / E-Wallet).
7. **Export Data**:
   - Unduh laporan kas, data anggota, pengeluaran, dan status kas bulanan ke dalam format **Excel (.xlsx)** atau **CSV**.

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

### 1. Prasyarat
- Node.js (v18+)
- MongoDB Atlas (atau MongoDB lokal)

### 2. Konfigurasi Environment (`.env`)
Buat file `.env` di root direktori proyek:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kas_db?retryWrites=true&w=majority
JWT_SECRET=rahasia_kas_super_aman_2026
PORT=5000
```

### 3. Menjalankan Server Backend
```bash
npm run server
```
Server backend akan berjalan di `http://localhost:5000`.

### 4. Menjalankan Frontend (Client)
Buka terminal baru:
```bash
npm run client
```
Aplikasi web akan terbuka di `http://localhost:3000`.

### 5. Akun Login Awal
- **Username**: `admin`
- **Password**: `admin123`
*(Bisa langsung diganti setelah login melalui menu Konfigurasi)*

---

## ☁️ Panduan Deploy ke Vercel (Serverless)

Aplikasi ini sudah dilengkapi file konfigurasi [vercel.json](file:///D:/ai-slop-ah/kas/vercel.json) sehingga dapat langsung di-deploy melalui Vercel Dashboard maupun Vercel CLI:

1. Push repository ini ke GitHub / GitLab.
2. Buka dashboard [Vercel](https://vercel.com/) dan pilih **Add New Project** -> **Import Git Repository**.
3. Pada halaman konfigurasi project di Vercel:
   - **Framework Preset**: Pilih `Other` (atau biarkan default karena sudah diatur oleh `vercel.json`).
   - Masukkan **Environment Variables**:
     - `MONGODB_URI`: String koneksi MongoDB Atlas Anda.
     - `JWT_SECRET`: Kunci rahasia JWT Anda.
4. Klik **Deploy**.
5. Vercel akan otomatis mem-build frontend dan mengaktifkan backend Express serverless di route `/api/*`.

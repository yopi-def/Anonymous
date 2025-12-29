# ⚡ Quick Start Guide

Panduan super cepat untuk menjalankan aplikasi Pesan Anonim dalam 5 menit!

## 📦 Yang Dibutuhkan

1. ✅ Node.js (v16+)
2. ✅ GitHub Token ([Cara dapat](https://github.com/settings/tokens))
3. ✅ Firebase Service Account JSON ([Cara dapat](https://console.firebase.google.com))

## 🚀 3 Langkah Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` → `.env` dan isi:

```env
PORT=3000
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/repository-name
GITHUB_BRANCH=main
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ADMIN_PASSWORD=your_password_here
```

**⚠️ PENTING:** `FIREBASE_SERVICE_ACCOUNT_JSON` harus dalam **SATU BARIS**!

### 3. Run Server

```bash
npm start
```

## 🌐 Akses Aplikasi

- **Homepage:** http://localhost:3000
- **Admin:** http://localhost:3000/yopi
- **Dashboard:** http://localhost:3000/yopi/dashboard

## 🎯 Test Cepat

1. Buka homepage
2. Ketik pesan test
3. Klik "Kirim"
4. Login admin dengan password
5. Lihat pesan di dashboard

## ✅ Berhasil!

Jika semua langkah di atas berjalan lancar, aplikasi sudah siap digunakan!

## 📚 Dokumentasi Lengkap

- **README.md** - Dokumentasi utama
- **TUTORIAL_ID.md** - Tutorial lengkap Bahasa Indonesia
- **PTERODACTYL_SETUP.md** - Panduan deploy ke Pterodactyl

## 🆘 Troubleshooting Cepat

| Error | Solusi |
|-------|---------|
| Firebase init failed | Cek JSON format (harus satu baris) |
| GitHub upload failed | Cek token & repository exists |
| Port in use | Ubah PORT di .env |
| Cannot find module | Run `npm install` |

## 📞 Butuh Bantuan?

Lihat file **TUTORIAL_ID.md** untuk panduan detail step-by-step!

---

Made with ⚡ for quick deployment

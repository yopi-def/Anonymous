# 📚 Tutorial Lengkap - Pesan Anonim

Panduan lengkap dalam Bahasa Indonesia untuk setup aplikasi Pesan Anonim dari nol sampai jalan.

---

## 📌 Daftar Isi

1. [Apa itu Pesan Anonim?](#apa-itu-pesan-anonim)
2. [Cara Kerja Aplikasi](#cara-kerja-aplikasi)
3. [Persiapan Awal](#persiapan-awal)
4. [Setup GitHub](#setup-github)
5. [Setup Firebase](#setup-firebase)
6. [Install & Run Lokal](#install--run-lokal)
7. [Deploy ke Pterodactyl](#deploy-ke-pterodactyl)
8. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🤔 Apa itu Pesan Anonim?

Pesan Anonim adalah aplikasi web yang memungkinkan orang mengirim pesan tanpa identitas. Fitur utama:

✅ Kirim pesan tanpa nama/identitas  
✅ Lampirkan gambar, video, atau dokumen  
✅ Admin bisa lihat semua pesan di dashboard  
✅ UI modern dan responsive  
✅ Rate limiting untuk cegah spam  

**Use Case:**
- Kotak saran anonim perusahaan
- Confession page sekolah/kampus
- Secret message untuk teman
- Feedback anonim

---

## ⚙️ Cara Kerja Aplikasi

```
┌─────────────┐
│   User      │ Kirim pesan + file
│  (Public)   │──────────────────┐
└─────────────┘                  │
                                 ▼
                         ┌───────────────┐
                         │ Express.js    │
                         │   Server      │
                         └───────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │ Firestore│  │  GitHub  │  │  Multer  │
            │ Database │  │   API    │  │  Upload  │
            └──────────┘  └──────────┘  └──────────┘
              (Metadata)    (Storage)     (Memory)
                    │
                    ▼
            ┌──────────────┐
            │    Admin     │
            │  Dashboard   │
            └──────────────┘
```

**Flow:**
1. User kirim pesan + file dari website
2. File diupload ke GitHub via API (jadi link)
3. Metadata (teks + link file) disimpan ke Firestore
4. Admin bisa lihat semua pesan di dashboard

---

## 🛠️ Persiapan Awal

### Yang Harus Disiapkan:

#### 1. **Node.js**
- Download: https://nodejs.org
- Versi: 16 atau lebih baru
- Cek instalasi: `node --version`

#### 2. **Text Editor**
- VS Code (recommended): https://code.visualstudio.com
- Atau editor apapun yang kamu suka

#### 3. **Akun GitHub**
- Daftar gratis di: https://github.com
- Verifikasi email

#### 4. **Akun Firebase**
- Daftar gratis di: https://firebase.google.com
- Pakai akun Google

#### 5. **Akun Pterodactyl** (untuk deploy)
- Atau bisa pakai VPS sendiri

---

## 🐙 Setup GitHub

### Langkah 1: Buat Repository untuk Storage

1. Login ke GitHub
2. Klik tombol **"+"** di kanan atas → **"New repository"**
3. Isi form:
   - Repository name: `pesan-anonim-storage`
   - Description: "Storage untuk file pesan anonim"
   - **Private** (recommended) atau Public
   - **JANGAN** centang "Add README"
4. Klik **"Create repository"**
5. **Catat nama repository:** `username/pesan-anonim-storage`

### Langkah 2: Generate Access Token

1. Klik foto profil → **"Settings"**
2. Scroll ke bawah → **"Developer settings"**
3. Klik **"Personal access tokens"** → **"Tokens (classic)"**
4. Klik **"Generate new token"** → **"Generate new token (classic)"**
5. Isi form:
   - Note: `Pesan Anonim Upload`
   - Expiration: **No expiration** (atau pilih waktu)
   - Scopes: Centang **"repo"** (Full control)
6. Scroll ke bawah → **"Generate token"**
7. **COPY TOKEN yang muncul!** (Tidak akan muncul lagi!)
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Simpan di tempat aman (Notepad/Notes)

✅ **GitHub Setup Selesai!**

---

## 🔥 Setup Firebase

### Langkah 1: Buat Project

1. Buka https://console.firebase.google.com
2. Klik **"Add project"** atau **"Create a project"**
3. Project name: `pesan-anonim` (atau nama lain)
4. Klik **"Continue"**
5. Google Analytics: Boleh dimatikan atau aktif (opsional)
6. Klik **"Create project"**
7. Tunggu proses selesai (~30 detik)
8. Klik **"Continue"**

### Langkah 2: Aktifkan Firestore

1. Di sidebar kiri, cari **"Firestore Database"**
2. Klik **"Create database"**
3. Pilih mode:
   - **Production mode** (recommended)
   - Rules bisa diubah nanti
4. Klik **"Next"**
5. Pilih lokasi:
   - Kalau di Indonesia: **asia-southeast1** (Singapore)
   - Atau pilih yang terdekat
6. Klik **"Enable"**
7. Tunggu proses selesai (~1 menit)

✅ **Firestore Database sudah aktif!**

### Langkah 3: Download Service Account

1. Klik **⚙️** (ikon gear) di sidebar kiri
2. Klik **"Project settings"**
3. Tab **"Service accounts"**
4. Klik **"Generate new private key"**
5. Pop-up muncul → Klik **"Generate key"**
6. File JSON akan otomatis terdownload
   - Nama file: `pesan-anonim-xxxxxxx-firebase-adminsdk-xxxxx.json`
7. **SIMPAN FILE INI!** Berisi credential penting!

### Langkah 4: Siapkan JSON untuk Environment Variable

File JSON yang didownload isinya seperti ini (multi-line):
```json
{
  "type": "service_account",
  "project_id": "pesan-anonim-xxxxx",
  "private_key_id": "xxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@pesan-anonim.iam.gserviceaccount.com",
  ...
}
```

**Harus dijadikan SATU BARIS:**

**Cara 1: Manual**
1. Copy semua isi file
2. Hapus semua Enter/line break
3. Jadi satu baris panjang

**Cara 2: Online Tool**
1. Buka https://jsonformatter.org
2. Paste JSON
3. Klik tab **"Minify"**
4. Copy hasilnya

**Cara 3: Command Line**
```bash
# Mac/Linux
cat namafile.json | tr -d '\n' > oneline.txt

# Windows (PowerShell)
Get-Content namafile.json -Raw | ForEach-Object { $_ -replace "\s+", "" } | Out-File oneline.txt
```

Hasil akhir (contoh):
```
{"type":"service_account","project_id":"pesan-anonim","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@pesan-anonim.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk"}
```

✅ **Firebase Setup Selesai!**

---

## 💻 Install & Run Lokal

### Langkah 1: Download Project

```bash
# Clone atau download project
git clone <repository-url>
cd pesan-anonim
```

Atau download ZIP, lalu extract.

### Langkah 2: Install Dependencies

```bash
npm install
```

Tunggu hingga selesai (~1-2 menit).

### Langkah 3: Setup Environment Variables

1. Copy file `.env.example` jadi `.env`:
```bash
# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

2. Edit file `.env` dengan text editor:
```
PORT=3000
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/pesan-anonim-storage
GITHUB_BRANCH=main
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"xxx",...}
ADMIN_PASSWORD=password_kamu_yang_kuat_123
```

**Isi dengan data Anda:**
- `GITHUB_TOKEN`: Token yang tadi dicopy dari GitHub
- `GITHUB_REPO`: Username/repository (contoh: `johndoe/pesan-anonim-storage`)
- `FIREBASE_SERVICE_ACCOUNT_JSON`: JSON satu baris yang tadi disiapkan
- `ADMIN_PASSWORD`: Buat password admin (minimal 8 karakter)

### Langkah 4: Run Server

```bash
npm start
```

**Output yang benar:**
```
✅ Firebase Firestore berhasil diinisialisasi
╔════════════════════════════════════════╗
║   🚀 PESAN ANONIM - SERVER RUNNING    ║
╚════════════════════════════════════════╝

🌐 Server URL    : http://localhost:3000
🔐 Admin Login   : http://localhost:3000/yopi
📊 Admin Dashboard: http://localhost:3000/yopi/dashboard
⏰ Started at    : 29/12/2024, 14:30:00 WIB
```

### Langkah 5: Test Aplikasi

1. **Buka browser**, akses: http://localhost:3000
2. **Kirim pesan test:**
   - Ketik pesan
   - Upload gambar (opsional)
   - Klik "Kirim"
   - Harus muncul notifikasi sukses ✅

3. **Login admin:**
   - Akses: http://localhost:3000/yopi
   - Masukkan password admin
   - Klik "Masuk"

4. **Cek dashboard:**
   - Harus redirect ke dashboard
   - Pesan test harus muncul
   - Bisa lihat statistik

✅ **Aplikasi berjalan di lokal!**

---

## 🚢 Deploy ke Pterodactyl

Lihat panduan lengkap di: [PTERODACTYL_SETUP.md](PTERODACTYL_SETUP.md)

**Ringkasan langkah:**
1. Upload files ke Pterodactyl
2. Run `npm install`
3. Set environment variables di panel
4. Set startup command: `node app.js`
5. Start server
6. Test akses via browser

---

## ❓ FAQ & Troubleshooting

### Q: Kenapa harus pakai GitHub untuk storage?

**A:** Ada beberapa alasan:
- ✅ Gratis dan unlimited storage
- ✅ CDN global (akses cepat dari mana saja)
- ✅ Reliable dan secure
- ✅ Mudah diakses via API
- ✅ Backup otomatis

Alternative lain: AWS S3, Cloudinary, ImgBB (tapi kebanyakan berbayar)

### Q: Apakah GitHub Token bisa expired?

**A:** Ya, tergantung setting saat generate:
- No expiration: Tidak expired
- 30/60/90 days: Expired sesuai waktu
- Custom: Sesuai waktu yang dipilih

**Solusi jika expired:**
- Generate token baru
- Update `GITHUB_TOKEN` di `.env`
- Restart server

### Q: Apakah Firebase gratis selamanya?

**A:** Firebase punya free tier yang cukup besar:
- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Untuk aplikasi kecil-menengah, free tier sudah cukup
- Jika melebihi, baru dicharge (pay-as-you-go)

### Q: Berapa limit file yang bisa diupload?

**A:** 
- **Per file:** 20MB maximum
- **Per request:** 4 files maximum
- **Total:** Unlimited (tergantung GitHub storage Anda)

### Q: Bisa pakai domain sendiri?

**A:** Bisa! Setup:
1. Beli domain (Namecheap, GoDaddy, dll)
2. Point A record ke IP server
3. Setup reverse proxy (Nginx/Apache)
4. Enable SSL dengan Let's Encrypt

### Q: Data user aman tidak?

**A:** Ya, aplikasi ini:
- ✅ Tidak simpan identitas pengirim
- ✅ IP address hanya untuk rate limiting
- ✅ Password admin di-hash (tidak plain text)
- ✅ HTTPS (jika pakai SSL)
- ✅ Rate limiting cegah spam
- ✅ File validation

### Q: Error "Firebase initialization failed"

**A:** Kemungkinan:
1. `FIREBASE_SERVICE_ACCOUNT_JSON` tidak valid
2. Ada line break di JSON (harus satu baris!)
3. Format JSON salah

**Solusi:**
1. Cek JSON pakai validator online
2. Pastikan satu baris
3. Download ulang service account
4. Coba copy-paste lagi dengan hati-hati

### Q: Error "GitHub upload failed"

**A:** Kemungkinan:
1. Token expired atau salah
2. Repository tidak exist
3. Token tidak punya akses ke repo
4. Network issue

**Solusi:**
1. Verifikasi token masih valid
2. Pastikan repository ada
3. Regenerate token dengan scope "repo"
4. Cek koneksi internet

### Q: Bagaimana cara backup data?

**A:** 
- **Firestore:** Export dari Firebase Console
- **Files:** Clone/download GitHub repository
- **Code:** Push ke Git repository

### Q: Bisa tambah fitur custom?

**A:** Tentu! Aplikasi ini open source, bisa dimodifikasi:
- Tambah field custom di form
- Ubah UI/design
- Tambah notifikasi (email, Telegram, dll)
- Integrasikan dengan service lain

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:

1. **Cek README.md** untuk dokumentasi lengkap
2. **Cek PTERODACTYL_SETUP.md** untuk deployment
3. **Lihat console** untuk error message
4. **Screenshot error** dan cari solusi di Google
5. **Buat issue** di repository (jika open source)

---

## 🎓 Tips untuk Pemula

### Tip 1: Pahami Struktur Project

```
pesan-anonim/
├── app.js              → Backend (server utama)
├── package.json        → Daftar dependencies
├── .env                → Config rahasia (jangan dicommit!)
└── public/             → Frontend (HTML files)
    ├── index.html      → Halaman kirim pesan
    ├── login.html      → Halaman login admin
    └── admin.html      → Dashboard admin
```

### Tip 2: Selalu Cek Console

Jika ada masalah, cek:
1. **Browser Console** (F12) → Untuk error frontend
2. **Server Console** → Untuk error backend

### Tip 3: Backup Sebelum Edit

Sebelum edit code:
1. Backup file asli
2. Atau commit ke Git
3. Baru edit dan test

### Tip 4: Test di Lokal Dulu

Sebelum deploy:
1. Test di komputer lokal dulu
2. Pastikan semua fitur jalan
3. Baru deploy ke server

### Tip 5: Gunakan Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <repository-url>
git push -u origin main
```

---

## ✅ Checklist Setup Sukses

Gunakan checklist ini untuk pastikan semua sudah benar:

### Persiapan:
- [ ] Node.js sudah terinstall
- [ ] Text editor siap
- [ ] Akun GitHub aktif
- [ ] Akun Firebase aktif

### GitHub:
- [ ] Repository sudah dibuat
- [ ] Token sudah digenerate
- [ ] Token sudah dicopy dan disimpan

### Firebase:
- [ ] Project sudah dibuat
- [ ] Firestore sudah aktif
- [ ] Service account JSON sudah didownload
- [ ] JSON sudah dijadikan satu baris

### Lokal Setup:
- [ ] Files sudah didownload
- [ ] `npm install` berhasil
- [ ] `.env` sudah diisi dengan benar
- [ ] Server bisa dijalankan
- [ ] Bisa kirim pesan test
- [ ] Admin login berhasil
- [ ] Dashboard menampilkan data

### Deployment (Optional):
- [ ] Files sudah diupload ke server
- [ ] Dependencies sudah terinstall
- [ ] Environment variables sudah diset
- [ ] Server berhasil start
- [ ] Aplikasi bisa diakses dari internet

---

## 🎉 Selesai!

Selamat! Jika semua checklist sudah ✅, artinya aplikasi Pesan Anonim Anda sudah siap digunakan!

**Next Steps:**
- Customize UI sesuai brand Anda
- Tambah fitur custom
- Share link ke teman-teman
- Monitor dan maintain aplikasi

**Semoga bermanfaat!** 🚀

---

Made with ❤️ in Indonesia

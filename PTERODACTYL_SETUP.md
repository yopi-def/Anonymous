# 🦖 Panduan Deploy ke Pterodactyl Panel

Panduan lengkap untuk deploy aplikasi Pesan Anonim ke Pterodactyl Panel.

## 📋 Persiapan Sebelum Deploy

### ✅ Checklist yang Harus Disiapkan:

1. **Akun & Akses:**
   - ✅ Akses ke Pterodactyl Panel
   - ✅ Server Node.js sudah dibuat di Pterodactyl

2. **GitHub:**
   - ✅ GitHub Personal Access Token (dengan scope "repo")
   - ✅ Repository kosong untuk menyimpan file uploads
   - ✅ Catat username/repository-name

3. **Firebase:**
   - ✅ Project Firebase sudah dibuat
   - ✅ Firestore sudah diaktifkan
   - ✅ Service Account JSON sudah didownload

4. **Password Admin:**
   - ✅ Tentukan password admin yang kuat

---

## 🚀 Langkah-Langkah Deployment

### **STEP 1: Upload Files ke Pterodactyl**

1. Login ke Pterodactyl Panel
2. Pilih server Node.js Anda
3. Masuk ke tab **"Files"**
4. Upload file-file berikut:

```
📁 Root Directory
├── app.js
├── package.json
└── 📁 public/
    ├── index.html
    ├── login.html
    └── admin.html
```

**Cara Upload:**
- Klik tombol **"Upload"**
- Drag & drop atau pilih file
- Pastikan struktur folder benar
- File `public/` harus dalam folder tersendiri

---

### **STEP 2: Install Dependencies**

1. Di Pterodactyl, buka tab **"Console"**
2. Jalankan command berikut:

```bash
npm install
```

3. Tunggu hingga instalasi selesai
4. Pastikan tidak ada error merah

**💡 Tips:** Jika terjadi error ENOENT, pastikan file `package.json` ada di root directory.

---

### **STEP 3: Setup Environment Variables**

#### A. Persiapkan Data Environment Variables

Buka file `.env.example` di komputer lokal Anda, atau gunakan template ini:

```env
PORT=25565
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/repository-name
GITHUB_BRANCH=main
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ADMIN_PASSWORD=your_strong_password
```

#### B. Masukkan ke Pterodactyl Panel

1. Di Pterodactyl, buka tab **"Startup"**
2. Scroll ke bawah ke section **"Environment Variables"**
3. Akan ada field untuk memasukkan variable
4. Masukkan satu per satu:

**Variable 1: PORT**
```
Key: PORT
Value: 25565
```
(Gunakan port yang disediakan Pterodactyl)

**Variable 2: GITHUB_TOKEN**
```
Key: GITHUB_TOKEN
Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(Token dari https://github.com/settings/tokens)

**Variable 3: GITHUB_REPO**
```
Key: GITHUB_REPO
Value: username/repository-name
```
(Contoh: johndoe/pesan-anonim-storage)

**Variable 4: GITHUB_BRANCH**
```
Key: GITHUB_BRANCH
Value: main
```
(Atau "master" jika repository menggunakan master)

**Variable 5: FIREBASE_SERVICE_ACCOUNT_JSON**
```
Key: FIREBASE_SERVICE_ACCOUNT_JSON
Value: {"type":"service_account","project_id":"xxx",...}
```

**⚠️ SANGAT PENTING untuk FIREBASE_SERVICE_ACCOUNT_JSON:**

1. Buka file service account JSON di text editor
2. Copy **SELURUH ISI** file
3. Pastikan dalam **SATU BARIS** (tidak ada Enter/line break)
4. Paste ke field Value

**Contoh JSON yang SALAH** (ada line break):
```json
{
  "type": "service_account",
  "project_id": "my-project",
  "private_key": "..."
}
```

**Contoh JSON yang BENAR** (satu baris):
```json
{"type":"service_account","project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"..."}
```

**💡 Cara membuat satu baris:**
- **Windows:** Buka Notepad++, Edit → Line Operations → Join Lines
- **Mac/Linux:** Gunakan command: `cat file.json | tr -d '\n'`
- **Online Tool:** jsonformatter.org → Minify

**Variable 6: ADMIN_PASSWORD**
```
Key: ADMIN_PASSWORD
Value: password_rahasia_yang_kuat_123!@#
```

---

### **STEP 4: Verifikasi Startup Script**

1. Di tab **"Startup"**, cari section **"Startup Command"**
2. Pastikan command adalah:

```bash
node app.js
```

3. Jika berbeda, edit menjadi `node app.js`
4. Klik **"Save"** jika ada perubahan

---

### **STEP 5: Start Server**

1. Kembali ke tab **"Console"**
2. Klik tombol **"Start"** (tombol hijau play)
3. Tunggu beberapa detik
4. Perhatikan console output

**Output yang BENAR:**
```
✅ Firebase Firestore berhasil diinisialisasi
╔════════════════════════════════════════╗
║   🚀 PESAN ANONIM - SERVER RUNNING    ║
╚════════════════════════════════════════╝
🌐 Server URL    : http://localhost:25565
🔐 Admin Login   : http://localhost:25565/yopi
📊 Admin Dashboard: http://localhost:25565/yopi/dashboard
⏰ Started at    : ...
```

**Jika ada ERROR:**
- ❌ Firebase initialization error → Cek `FIREBASE_SERVICE_ACCOUNT_JSON`
- ❌ Port already in use → Server sudah jalan atau port konflik
- ❌ Cannot find module → Jalankan `npm install` lagi

---

### **STEP 6: Testing Aplikasi**

#### A. Akses Aplikasi

Buka browser dan akses:
```
http://your-server-ip:25565
```
(Ganti dengan IP/domain server Anda)

#### B. Test Kirim Pesan

1. Buka halaman utama
2. Ketik pesan
3. Upload file (opsional)
4. Klik **"Kirim Pesan Anonim"**
5. Jika berhasil, akan muncul notifikasi sukses ✅

#### C. Test Admin Dashboard

1. Akses: `http://your-server-ip:25565/yopi`
2. Masukkan password admin
3. Jika benar, akan redirect ke dashboard
4. Pesan yang baru dikirim harus muncul di dashboard

---

## 🔧 Troubleshooting

### ❌ Error: Cannot find module 'express'

**Solusi:**
```bash
npm install
```

### ❌ Error: Firebase initialization failed

**Kemungkinan Penyebab:**
1. JSON tidak valid (ada line break)
2. Field JSON ada yang kurang
3. Format JSON salah

**Solusi:**
1. Cek `FIREBASE_SERVICE_ACCOUNT_JSON` di Environment Variables
2. Pastikan dalam satu baris
3. Gunakan validator JSON online untuk cek format
4. Download ulang service account JSON dari Firebase

### ❌ Error: GitHub upload failed

**Kemungkinan Penyebab:**
1. Token expired atau salah
2. Repository tidak ada
3. Token tidak punya akses ke repository

**Solusi:**
1. Generate token baru di GitHub
2. Pastikan scope "repo" dicentang
3. Pastikan repository exists
4. Update `GITHUB_TOKEN` di Environment Variables
5. Restart server

### ❌ Error: Port already in use

**Solusi:**
```bash
# Stop server terlebih dahulu
# Lalu start lagi
```

### ❌ Admin login tidak bisa masuk

**Solusi:**
1. Cek `ADMIN_PASSWORD` di Environment Variables
2. Pastikan tidak ada spasi di awal/akhir password
3. Clear browser cache & cookies
4. Try incognito/private mode

### ❌ File upload gagal terus

**Kemungkinan Penyebab:**
1. File terlalu besar (>20MB)
2. GitHub token tidak valid
3. Network issue

**Solusi:**
1. Cek ukuran file
2. Verifikasi GitHub token
3. Cek console untuk error detail

---

## 📊 Monitoring & Maintenance

### Cek Status Server

Di tab **"Console"**, perhatikan log:
- ✅ Hijau = Server berjalan normal
- ❌ Merah = Ada error
- ⚠️ Kuning = Warning

### Restart Server

Jika ada masalah:
1. Klik tombol **"Stop"** (merah)
2. Tunggu hingga benar-benar stop
3. Klik tombol **"Start"** (hijau)

### Update Environment Variable

Jika perlu update variable:
1. Stop server terlebih dahulu
2. Edit di tab **"Startup"** → **"Environment Variables"**
3. Klik **"Save"**
4. Start server kembali

### Backup Data

**Data Firestore:**
- Sudah otomatis tersimpan di Firebase Cloud
- Bisa diexport dari Firebase Console

**File Uploads:**
- Tersimpan di GitHub repository
- Download dari repository untuk backup

---

## 🎯 Tips & Best Practices

### 🔒 Security Tips:

1. **Gunakan password admin yang kuat:**
   - Minimal 12 karakter
   - Kombinasi huruf besar, kecil, angka, simbol
   - Contoh: `MyStr0ng!Pass@2024`

2. **Private Repository:**
   - Gunakan private repository untuk uploads
   - Lebih aman untuk data sensitif

3. **Rate Limiting:**
   - Sudah aktif by default (5 pesan/jam)
   - Cegah spam dan abuse

### 🚀 Performance Tips:

1. **Firestore Indexes:**
   - Firebase akan suggest index yang perlu dibuat
   - Follow recommendation di Firebase Console

2. **GitHub Rate Limits:**
   - Free account: 5000 requests/hour
   - Cukup untuk aplikasi kecil-menengah

3. **Monitor Resource:**
   - Cek usage RAM & CPU di Pterodactyl
   - Upgrade plan jika perlu

### 📱 Domain Custom:

Jika ingin pakai domain sendiri:
1. Setup DNS A Record → IP server
2. Setup reverse proxy (Nginx/Apache)
3. Enable SSL/HTTPS (Let's Encrypt)

---

## 📞 Support

Jika masih ada masalah:
1. Cek log error di Console
2. Screenshot error message
3. Cek README.md untuk troubleshooting lebih lanjut

---

## ✅ Deployment Checklist

Gunakan checklist ini untuk memastikan semua sudah benar:

- [ ] Files sudah diupload ke Pterodactyl
- [ ] `npm install` berhasil tanpa error
- [ ] Environment variables sudah diset semua:
  - [ ] PORT
  - [ ] GITHUB_TOKEN
  - [ ] GITHUB_REPO
  - [ ] GITHUB_BRANCH
  - [ ] FIREBASE_SERVICE_ACCOUNT_JSON (satu baris!)
  - [ ] ADMIN_PASSWORD
- [ ] Startup command adalah `node app.js`
- [ ] Server berhasil start tanpa error
- [ ] Homepage bisa diakses
- [ ] Bisa kirim pesan test
- [ ] Admin login berhasil
- [ ] Dashboard menampilkan pesan

Jika semua checklist ✅, **Selamat! Deployment berhasil!** 🎉

---

Made with ❤️ for Pterodactyl Panel Users

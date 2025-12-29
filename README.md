# 📬 Pesan Anonim - Full-Stack Web Application

Aplikasi web untuk mengirim dan menerima pesan anonim dengan dukungan lampiran file (gambar, video, dokumen). Dibangun dengan Express.js, Firebase Firestore, dan GitHub API untuk storage.

## ✨ Fitur Utama

### 🎯 **Untuk Pengirim (Public)**
- ✉️ Kirim pesan anonim tanpa identitas
- 📎 Lampirkan hingga 4 file (gambar, video, dokumen)
- 🎨 UI modern dengan Glassmorphism design
- 📱 Responsive untuk semua device
- 🔒 Rate limiting (5 pesan/jam per IP)
- 💾 Client-side limit (5 pesan/hari per device)

### 👨‍💼 **Untuk Admin (Protected)**
- 📊 Dashboard dengan statistik real-time
- 🔍 Filter pesan by kategori (Foto/Video/Dokumen/Semua)
- 🖼️ Preview media langsung di dashboard
- 🗑️ Hapus pesan
- ⏰ Timestamp dalam zona waktu WIB
- 🔄 Auto-refresh setiap 30 detik

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js (CommonJS)
- Firebase Firestore (Database)
- GitHub API (File Storage)
- Multer (File Upload)

**Frontend:**
- Tailwind CSS + DaisyUI
- Lucide Icons
- SweetAlert2
- AOS Animation
- Day.js (Time formatting)

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah memiliki:
- Node.js (v16 atau lebih tinggi)
- Akun GitHub
- Akun Firebase (dengan Firestore enabled)
- Repository GitHub kosong untuk menyimpan file

## 🚀 Cara Setup

### 1️⃣ **Clone/Download Project**

```bash
git clone <repository-url>
cd pesan-anonim
```

### 2️⃣ **Install Dependencies**

```bash
npm install
```

### 3️⃣ **Setup GitHub Token**

1. Buka https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. Beri nama token, contoh: "Pesan Anonim Upload"
4. Centang scope **"repo"** (Full control of private repositories)
5. Klik **"Generate token"**
6. **SIMPAN** token yang muncul (hanya ditampilkan sekali!)

### 4️⃣ **Setup GitHub Repository untuk Storage**

1. Buat repository baru di GitHub
2. Nama bebas, contoh: `pesan-anonim-storage`
3. Bisa **public** atau **private** (private lebih aman)
4. **Jangan** tambahkan file apapun, biarkan kosong
5. Catat nama repository dalam format: `username/repository-name`

### 5️⃣ **Setup Firebase Firestore**

#### Buat Project Firebase:
1. Buka https://console.firebase.google.com
2. Klik **"Add project"** atau **"Create a project"**
3. Beri nama project, contoh: "pesan-anonim"
4. Ikuti wizard setup hingga selesai

#### Enable Firestore:
1. Di Firebase Console, pilih project Anda
2. Di sidebar, klik **"Firestore Database"**
3. Klik **"Create database"**
4. Pilih mode:
   - **Production mode** (direkomendasikan) - Data protected by rules
   - **Test mode** - Anyone can read/write (hanya untuk testing)
5. Pilih lokasi server (pilih yang terdekat, contoh: asia-southeast1)
6. Klik **"Enable"**

#### Generate Service Account:
1. Klik ⚙️ (ikon Settings) di sidebar kiri
2. Pilih **"Project settings"**
3. Buka tab **"Service accounts"**
4. Klik tombol **"Generate new private key"**
5. Konfirmasi dengan klik **"Generate key"**
6. File JSON akan otomatis terdownload
7. **SIMPAN** file ini dengan aman (berisi credential penting!)

### 6️⃣ **Konfigurasi Environment Variables**

1. Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Edit file `.env` dengan text editor:
```bash
nano .env
# atau
code .env
```

3. Isi dengan data Anda:

```env
PORT=3000

# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/repository-name
GITHUB_BRANCH=main

# Firebase Configuration (HARUS DALAM SATU BARIS!)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

# Admin Password
ADMIN_PASSWORD=password_rahasia_yang_kuat_123
```

**⚠️ PENTING untuk FIREBASE_SERVICE_ACCOUNT_JSON:**
- Buka file JSON yang didownload dari Firebase
- Copy **SEMUA ISI** file tersebut
- Paste sebagai value dari `FIREBASE_SERVICE_ACCOUNT_JSON`
- **HARUS dalam satu baris** (tanpa line break/enter)
- Jangan ubah format JSON-nya

Contoh format yang benar:
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"my-project-123","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...your_key_here...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@my-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk"}
```

## 🖥️ Menjalankan Aplikasi

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Aplikasi akan berjalan di: `http://localhost:3000`

## 📱 Akses Aplikasi

- **Homepage (Kirim Pesan):** http://localhost:3000/
- **Admin Login:** http://localhost:3000/yopi
- **Admin Dashboard:** http://localhost:3000/yopi/dashboard

## 🚢 Deploy ke Pterodactyl Panel

### 1️⃣ **Upload Files**

Upload semua file ke Pterodactyl Panel:
- `app.js`
- `package.json`
- `public/` folder (semua file HTML)

### 2️⃣ **Install Dependencies**

Di terminal Pterodactyl, jalankan:
```bash
npm install
```

### 3️⃣ **Set Environment Variables**

Di Pterodactyl Panel:
1. Buka tab **"Startup"**
2. Scroll ke bagian **"Environment Variables"**
3. Tambahkan variable satu per satu:
   - `GITHUB_TOKEN`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (pastikan satu baris!)
   - `ADMIN_PASSWORD`

**💡 Tips:** Untuk `FIREBASE_SERVICE_ACCOUNT_JSON`, jika terlalu panjang, bisa menggunakan base64:
```bash
# Encode
cat serviceAccount.json | base64 -w 0

# Lalu di app.js, decode dengan:
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString());
```

### 4️⃣ **Set Startup Command**

Pastikan startup command adalah:
```bash
node app.js
```

### 5️⃣ **Start Server**

Klik tombol **"Start"** di Pterodactyl Panel.

## 📡 API Endpoints

### Public Endpoints:
- `GET /` - Homepage
- `POST /api/send` - Kirim pesan (Rate limited: 5/hour)
- `GET /api/health` - Health check

### Admin Endpoints (Require Password):
- `GET /yopi` - Login page
- `GET /yopi/dashboard` - Dashboard
- `GET /api/messages?password=xxx` - Get all messages
- `DELETE /api/messages/:id?password=xxx` - Delete message
- `GET /api/stats?password=xxx` - Get statistics

## 🔒 Security Features

1. **Rate Limiting:** 5 pesan per jam per IP
2. **File Validation:** Type dan size checking
3. **Admin Auth:** Password protection untuk admin routes
4. **Helmet.js:** Security headers
5. **CORS:** Cross-origin protection
6. **Input Sanitization:** XSS prevention

## 📝 File Structure

```
pesan-anonim/
├── app.js                 # Backend utama (Express server)
├── package.json           # Dependencies
├── .env                   # Environment variables (jangan commit!)
├── .env.example           # Template environment variables
├── README.md              # Dokumentasi
└── public/                # Frontend files
    ├── index.html         # Homepage (kirim pesan)
    ├── login.html         # Admin login
    └── admin.html         # Admin dashboard
```

## ⚙️ Konfigurasi

### Limits:
- **Max file size:** 20MB per file
- **Max files:** 4 files per submission
- **Max message length:** 5000 characters
- **Rate limit:** 5 messages per hour per IP
- **Client limit:** 5 messages per day per device (localStorage)

### Supported File Types:
- **Images:** JPEG, PNG, GIF, WebP, SVG
- **Videos:** MP4, WebM, QuickTime, AVI
- **Documents:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- **Archives:** ZIP, RAR

## 🐛 Troubleshooting

### Error: Firebase initialization failed
- Pastikan `FIREBASE_SERVICE_ACCOUNT_JSON` dalam format JSON yang valid
- Pastikan dalam satu baris tanpa line break
- Cek apakah semua field JSON ada (type, project_id, private_key, dll)

### Error: GitHub upload failed
- Pastikan `GITHUB_TOKEN` valid dan tidak expired
- Pastikan repository exists dan token punya akses ke repo
- Pastikan `GITHUB_REPO` dalam format `username/repository-name`

### Error: 401 Unauthorized di admin
- Pastikan password admin benar
- Clear sessionStorage di browser dan login ulang

### Port sudah digunakan
- Ubah `PORT` di `.env` ke port lain
- Atau matikan aplikasi yang menggunakan port tersebut

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Support

Jika ada pertanyaan atau menemukan bug, silakan buat issue di repository.

---

Made with ❤️ by Anonymous Dev ArvynPro
```

/**
 * ============================================
 * PESAN ANONIM - BACKEND APPLICATION
 * ============================================
 * Full-Stack Anonymous Message App
 * Tech Stack: Express.js + Firebase Firestore + GitHub API
 * Module System: CommonJS (require)
 * ============================================
 */

// ============================================
// IMPORT DEPENDENCIES
// ============================================
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const admin = require('firebase-admin');
const axios = require('axios');
const { rateLimit } = require('express-rate-limit');
const path = require('path');

// ============================================
// LOAD ENVIRONMENT VARIABLES
// ============================================
dotenv.config();

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// FIREBASE INITIALIZATION
// ============================================
let db;
try {
  // Parse Service Account JSON dari environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  // Get Firestore instance
  db = admin.firestore();
  
  console.log('✅ Firebase Firestore berhasil diinisialisasi');
} catch (error) {
  console.error('❌ Error inisialisasi Firebase:', error.message);
  console.error('💡 Pastikan FIREBASE_SERVICE_ACCOUNT_JSON sudah diset dengan benar');
  process.exit(1);
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security headers dengan Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable untuk mengizinkan CDN eksternal
  crossOriginEmbedderPolicy: false
}));

// Enable CORS untuk semua origin
app.use(cors());

// Body parser untuk JSON dan URL-encoded data
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// MULTER CONFIGURATION (Memory Storage)
// ============================================

// Gunakan memory storage agar tidak menulis ke disk
const storage = multer.memoryStorage();

// Konfigurasi multer dengan validasi
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB maximum per file
    files: 4 // Maximum 4 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Daftar MIME types yang diizinkan
    const allowedMimes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      // Documents
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak diizinkan'), false);
    }
  }
});

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

// Rate limiter untuk endpoint pengiriman pesan
// Maksimal 5 pesan per jam per IP address
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // Max 5 requests per hour per IP
  message: { 
    success: false, 
    message: 'Terlalu banyak pesan dikirim dari IP ini. Silakan coba lagi dalam 1 jam.' 
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak pesan dikirim. Coba lagi dalam 1 jam.',
      retryAfter: 3600 // seconds
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Upload file ke GitHub Repository menggunakan GitHub API
 * @param {Buffer} fileBuffer - File buffer dari multer
 * @param {string} fileName - Nama file original
 * @param {string} mimeType - MIME type file
 * @returns {Promise<string>} URL raw file di GitHub
 */
async function uploadToGitHub(fileBuffer, fileName, mimeType) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error('GitHub configuration tidak lengkap');
    }
    
    // Generate unique filename dengan timestamp
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext)
      .replace(/[^a-z0-9]/gi, '_') // Replace special chars
      .substring(0, 50); // Limit length
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    
    // Tentukan folder berdasarkan MIME type
    let folder = 'others';
    if (mimeType.startsWith('image/')) {
      folder = 'images';
    } else if (mimeType.startsWith('video/')) {
      folder = 'videos';
    } else if (mimeType === 'application/pdf' || mimeType.includes('document')) {
      folder = 'documents';
    }
    
    // Path lengkap di GitHub
    const filePath = `uploads/${folder}/${uniqueFileName}`;
    
    // Convert buffer to base64
    const base64Content = fileBuffer.toString('base64');
    
    // GitHub API endpoint untuk create/update file
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    // Upload ke GitHub via API
    const response = await axios.put(
      url,
      {
        message: `Upload file: ${uniqueFileName}`,
        content: base64Content,
        branch: GITHUB_BRANCH
      },
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    // Return URL raw file (direct access)
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
    
    console.log(`✅ File uploaded to GitHub: ${rawUrl}`);
    return rawUrl;
    
  } catch (error) {
    console.error('❌ GitHub upload error:', error.response?.data || error.message);
    throw new Error('Gagal upload file ke GitHub: ' + (error.response?.data?.message || error.message));
  }
}

/**
 * Get waktu sekarang dalam timezone WIB (UTC+7)
 * @returns {string} ISO string dalam WIB timezone
 */
function getWIBTime() {
  const now = new Date();
  // WIB adalah UTC+7 (7 * 60 = 420 menit)
  const wibOffset = 7 * 60;
  const wibTime = new Date(now.getTime() + (wibOffset * 60 * 1000));
  return wibTime.toISOString();
}

/**
 * Tentukan kategori media berdasarkan MIME type
 * @param {string} mimeType - MIME type file
 * @returns {string} Kategori: 'image', 'video', atau 'other'
 */
function getMediaCategory(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
}

/**
 * Format bytes ke ukuran yang readable
 * @param {number} bytes - Ukuran dalam bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// MIDDLEWARE: ADMIN AUTHENTICATION
// ============================================

/**
 * Middleware untuk memvalidasi admin password
 * Password bisa dikirim via header atau query parameter
 */
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  const correctPassword = process.env.ADMIN_PASSWORD;
  
  if (!correctPassword) {
    return res.status(500).json({ 
      success: false, 
      message: 'Admin password belum dikonfigurasi di server' 
    });
  }
  
  if (password === correctPassword) {
    next(); // Password benar, lanjutkan
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Password admin salah' 
    });
  }
}

// ============================================
// ROUTES - PUBLIC
// ============================================

/**
 * GET / - Homepage (Halaman kirim pesan)
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * GET /yopi - Admin Login Page
 */
app.get('/yopi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/**
 * GET /yopi/dashboard - Admin Dashboard
 */
app.get('/yopi/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage()
  });
});

// ============================================
// ROUTES - MESSAGE HANDLING
// ============================================

/**
 * POST /api/send - Kirim pesan anonim
 * Rate limited: 5 pesan per jam per IP
 * Accept: multipart/form-data dengan field 'message' dan 'files'
 */
app.post('/api/send', messageLimiter, upload.array('files', 4), async (req, res) => {
  try {
    const { message } = req.body;
    const files = req.files || [];
    
    // ===== VALIDATION =====
    
    // Validasi: Pesan tidak boleh kosong
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pesan tidak boleh kosong!' 
      });
    }
    
    // Validasi: Panjang pesan maksimal 5000 karakter
    if (message.length > 5000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pesan terlalu panjang! Maksimal 5000 karakter.' 
      });
    }
    
    // Validasi: Minimal ada pesan atau file
    if (message.trim().length === 0 && files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kirim minimal pesan atau file!' 
      });
    }
    
    console.log(`📩 Menerima pesan baru dengan ${files.length} file(s)`);
    
    // ===== FILE UPLOAD TO GITHUB =====
    
    const uploadedFiles = [];
    
    // Upload setiap file ke GitHub
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.originalname} (${formatFileSize(file.size)})`);
        
        // Upload ke GitHub
        const fileUrl = await uploadToGitHub(
          file.buffer, 
          file.originalname, 
          file.mimetype
        );
        
        // Simpan info file yang berhasil diupload
        uploadedFiles.push({
          url: fileUrl,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          category: getMediaCategory(file.mimetype)
        });
        
        console.log(`✅ File ${i + 1} berhasil diupload`);
        
      } catch (uploadError) {
        console.error(`❌ Gagal upload file ${file.originalname}:`, uploadError.message);
        // Lanjutkan dengan file berikutnya jika ada yang gagal
        // Tidak throw error agar file lain tetap diproses
      }
    }
    
    // ===== SAVE TO FIRESTORE =====
    
    const messageData = {
      text: message.trim(),
      files: uploadedFiles,
      filesCount: uploadedFiles.length,
      timestamp: getWIBTime(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      hasMedia: uploadedFiles.length > 0
    };
    
    // Simpan ke Firestore collection 'messages'
    const docRef = await db.collection('messages').add(messageData);
    
    console.log(`✅ Pesan berhasil disimpan dengan ID: ${docRef.id}`);
    
    // ===== SEND RESPONSE =====
    
    res.status(200).json({ 
      success: true, 
      message: 'Pesan berhasil dikirim! 🎉',
      data: {
        id: docRef.id,
        filesUploaded: uploadedFiles.length,
        filesTotal: files.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error mengirim pesan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengirim pesan: ' + error.message 
    });
  }
});

// ============================================
// ROUTES - ADMIN (Protected)
// ============================================

/**
 * GET /api/messages - Ambil semua pesan (Admin only)
 * Query params:
 * - category: 'image' | 'video' | 'other' | 'all' (default: 'all')
 * - limit: number (default: 100)
 * - password: admin password
 */
app.get('/api/messages', requireAdmin, async (req, res) => {
  try {
    const { category = 'all', limit = 100 } = req.query;
    
    // Query Firestore, urutkan berdasarkan timestamp terbaru
    let query = db.collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    let messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp ke ISO string
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
      });
    });
    
    // Filter berdasarkan kategori jika bukan 'all'
    if (category && category !== 'all') {
      messages = messages.filter(msg => {
        if (!msg.files || msg.files.length === 0) return false;
        // Pesan dianggap masuk kategori jika punya minimal 1 file dengan kategori tersebut
        return msg.files.some(file => file.category === category);
      });
    }
    
    console.log(`📊 Admin mengambil ${messages.length} pesan (filter: ${category})`);
    
    res.json({ 
      success: true, 
      count: messages.length,
      filter: category,
      data: messages 
    });
    
  } catch (error) {
    console.error('❌ Error mengambil pesan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data pesan: ' + error.message 
    });
  }
});

/**
 * DELETE /api/messages/:id - Hapus pesan (Admin only)
 */
app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hapus dokumen dari Firestore
    await db.collection('messages').doc(id).delete();
    
    console.log(`🗑️ Admin menghapus pesan: ${id}`);
    
    res.json({ 
      success: true, 
      message: 'Pesan berhasil dihapus' 
    });
    
  } catch (error) {
    console.error('❌ Error menghapus pesan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus pesan: ' + error.message 
    });
  }
});

/**
 * GET /api/stats - Statistik aplikasi (Admin only)
 */
app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('messages').get();
    
    let totalMessages = 0;
    let messagesWithMedia = 0;
    let totalFiles = 0;
    let totalSize = 0;
    let categoryCount = { image: 0, video: 0, other: 0 };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalMessages++;
      
      if (data.files && data.files.length > 0) {
        messagesWithMedia++;
        totalFiles += data.files.length;
        
        data.files.forEach(file => {
          categoryCount[file.category]++;
          totalSize += file.size || 0;
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        totalMessages,
        messagesWithMedia,
        messagesTextOnly: totalMessages - messagesWithMedia,
        totalFiles,
        totalSize: formatFileSize(totalSize),
        filesByCategory: categoryCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error mengambil statistik:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil statistik: ' + error.message 
    });
  }
});

// ============================================
// ERROR HANDLERS
// ============================================

// Handle Multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ukuran file terlalu besar! Maksimal 20MB per file.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Terlalu banyak file! Maksimal 4 file per pengiriman.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: 'Error upload file: ' + error.message 
    });
  }
  
  if (error.message === 'Tipe file tidak diizinkan') {
    return res.status(400).json({ 
      success: false, 
      message: 'Tipe file tidak diizinkan. Hanya gambar, video, dan dokumen yang diperbolehkan.' 
    });
  }
  
  next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Terjadi kesalahan server internal.' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint tidak ditemukan' 
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 PESAN ANONIM - SERVER RUNNING    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Server URL    : http://localhost:${PORT}`);
  console.log(`🔐 Admin Login   : http://localhost:${PORT}/yopi`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/yopi/dashboard`);
  console.log(`⏰ Started at    : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`);
  console.log('');
  console.log('📝 Tekan CTRL+C untuk menghentikan server');
  console.log('');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM signal received: Closing HTTP server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT signal received: Closing HTTP server...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

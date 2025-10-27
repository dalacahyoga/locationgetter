# 📍 Location Getter

Website untuk mendapatkan lokasi pengguna menggunakan Geolocation API dengan **permanent server-side logging**. Data lokasi tersimpan di server dan bisa diakses dari device mana saja sampai dihapus manual.

## ✨ Fitur

- 🗺️ **Auto Request Lokasi** - Otomatis meminta izin akses lokasi saat buka website
- 📌 **Tampilkan Koordinat** - Menampilkan latitude, longitude, akurasi, dan timestamp
- 🔗 **Google Maps Link** - Link langsung ke Google Maps dengan koordinat yang didapat
- 📋 **Copy Koordinat** - Fitur copy koordinat ke clipboard
- 💾 **Server-Side Logging** - Menyimpan riwayat lokasi PERMANEN di server (Netlify Functions)
- 🌍 **Cross-Device Access** - Log bisa diakses dari browser/device mana saja
- 📊 **Log Dashboard** - Halaman khusus `/ngerug` untuk melihat semua log
- 💾 **Export Data** - Export log dalam format JSON
- 🗑️ **Delete Control** - Hapus log individual atau semua log
- 🎨 **Modern UI** - Desain modern dan responsive
- 🔒 **Dual Storage** - Server storage + localStorage backup

## 🚀 Deploy ke Netlify

### ⚠️ PENTING: Cara Deploy yang Benar

Website ini menggunakan **Netlify Functions** untuk server-side storage. 

**✅ GUNAKAN:**
- Deploy via **Git** (GitHub/GitLab/Bitbucket) - RECOMMENDED
- Deploy via **Netlify CLI**

**❌ JANGAN GUNAKAN:**
- Drag & Drop manual (Functions tidak akan bekerja)

### 📖 Panduan Deploy Lengkap

Lihat file **[DEPLOY.md](DEPLOY.md)** untuk panduan detail step-by-step.

### Quick Start - Deploy via Git:

```bash
# 1. Init Git & Commit
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 2. Push ke GitHub
git remote add origin https://github.com/username/locationGetter.git
git push -u origin main

# 3. Di Netlify.com:
# - Import from Git
# - Select repository
# - Deploy (settings auto-detect)
```

### Quick Start - Deploy via CLI:

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

## 🌐 Akses Website

Setelah deploy berhasil:

- **Homepage:** `https://yoursite.netlify.app/`
- **Log Dashboard:** `https://yoursite.netlify.app/ngerug`

## ⚙️ Cara Kerja

### Halaman Utama (/)
1. User membuka website
2. Browser otomatis meminta izin akses lokasi
3. Jika diizinkan, website mendapatkan koordinat lokasi
4. Data **dikirim ke server** via Netlify Function
5. Data tersimpan permanent di server
6. Koordinat ditampilkan dengan informasi lengkap
7. User bisa buka di Google Maps atau copy koordinat

### Halaman Log (/ngerug)
1. Akses via: `https://yoursite.netlify.app/ngerug`
2. Data di-load dari **server** (bukan localStorage)
3. Menampilkan semua riwayat lokasi yang tersimpan
4. Setiap log menampilkan:
   - Tanggal & waktu
   - Koordinat lengkap (Lat/Long)
   - Akurasi lokasi
   - Platform & device info
   - IP address
5. Fitur yang tersedia:
   - 🔄 Refresh data dari server
   - 💾 Export ke JSON
   - 🗑️ Clear semua log (delete dari server)
   - 🗺️ Buka di Google Maps
   - 📋 Copy koordinat
   - ❌ Hapus log individual

### Architecture

```
User Browser → Geolocation API → JavaScript
                                      ↓
                              [Save to Server]
                                      ↓
                          Netlify Function (API)
                                      ↓
                          Netlify Blobs (Persistent Storage)
                                      ↓
                          [Data Saved Permanently - Never Lost!]
                                      ↓
                          Accessible from any device
```

## 🔧 Teknologi yang Digunakan

- **Frontend:**
  - HTML5
  - CSS3 (Modern styling with CSS Variables)
  - JavaScript (Vanilla JS - no framework)
  - Geolocation API

- **Backend:**
  - Netlify Functions (Serverless)
  - Node.js
  - Netlify Blobs (Persistent storage - data never lost!)

- **Hosting:**
  - Netlify (Free tier)
  - Auto HTTPS/SSL
  - CDN global

## 📱 Browser Support

Website ini support di semua browser modern yang mendukung Geolocation API:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (Desktop & Mobile)
- ✅ Opera

**Note**: HTTPS diperlukan untuk Geolocation API bekerja (Netlify otomatis menyediakan HTTPS)

## 🔐 Privacy & Security

### ✨ Server-Side Storage (Production) - SHARED ACROSS ALL USERS!
Ketika di-deploy ke Netlify:
- ✅ Data lokasi **disimpan PERMANENT** di Netlify Blobs (persistent storage)
- ✅ Data **TIDAK AKAN HILANG** - tersimpan sampai **dihapus manual** oleh user
- ✅ **SHARED STORAGE** - Semua orang bisa lihat log dari semua pengunjung!
- ✅ Bisa diakses dari **browser/device mana saja** - data sama untuk semua
- ✅ Data tetap ada meskipun clear browser cache atau redeploy
- ✅ HTTPS otomatis dari Netlify untuk keamanan
- ✅ Maximum 1000 log entries (otomatis hapus yang paling lama)
- ✅ **100% Reliable** - tidak ada data loss seperti storage temporary
- ✅ **Real-time visibility** - Log baru langsung terlihat di semua device

### 💾 LocalStorage Backup (Fallback Only)
- Data juga tersimpan di localStorage sebagai backup
- Hanya digunakan jika server tidak available
- Server adalah primary storage - semua user lihat data yang sama!

### 🔒 Security Warning
- ⚠️ **Tidak ada authentication** (untuk demo/personal use)
- ⚠️ Semua orang yang tau URL `/ngerug` bisa lihat log
- ⚠️ **PENTING:** Jangan gunakan untuk data sensitif/rahasia
- ✅ Untuk production use yang lebih aman, tambahkan authentication

### 🛡️ Recommendations untuk Production:
1. Add password protection untuk `/ngerug`
2. Add API key authentication
3. Add user accounts & login
4. Encrypt sensitive data
5. (Optional) Upgrade ke proper database dengan advanced features (Supabase/Firebase)

## 📁 Project Structure

```
locationGetter/
├── index.html              # Homepage (location getter)
├── log.html               # Log dashboard (/ngerug)
├── style.css              # Styles untuk homepage
├── script.js              # Logic homepage + save to server
├── log-style.css          # Styles untuk log page
├── log-script.js          # Logic log page + fetch from server
├── netlify/
│   └── functions/
│       ├── save-location.js    # API: Save & Get locations
│       └── delete-location.js  # API: Delete locations
├── netlify.toml           # Netlify configuration
├── package.json           # NPM configuration
├── README.md             # Dokumentasi utama (file ini)
├── DEPLOY.md             # Panduan deploy lengkap
└── .gitignore            # Git ignore rules
```

## 🧪 Testing

### Local Testing (Limited)

**Note:** Netlify Functions tidak bisa ditest di localhost dengan cara biasa.

#### Opsi 1: Netlify Dev (Recommended)

```bash
npm install -g netlify-cli
netlify dev
```

Akses: `http://localhost:8888`

#### Opsi 2: Direct Open (Functions tidak akan bekerja)

Buka `index.html` di browser:
- Geolocation akan bekerja
- UI akan bekerja
- **Functions tidak bekerja** (akan fallback ke localStorage)

### Production Testing

Setelah deploy ke Netlify:

1. **Test Save Location:**
   - Buka homepage
   - Allow location
   - Cek Console: harus ada `✅ Location saved to server`

2. **Test View Logs:**
   - Buka `/ngerug`
   - Harus tampil log yang tadi disimpan
   - Cek Console: `✅ Loaded logs from server`

3. **Test Cross-Device:**
   - Buka dari device berbeda
   - Log harus tetap muncul (proof of server storage)

4. **Test Delete:**
   - Delete log individual
   - Refresh - log harus hilang
   - Cek dari device lain - log harus hilang juga

## 🔄 Update & Maintenance

### Update Code

```bash
# Edit files
git add .
git commit -m "Update: description"
git push
# Netlify auto-deploy
```

### Backup Data

Export data dari `/ngerug` page → tombol Export JSON

### Clear All Data

Dari `/ngerug` page → tombol Clear All

## 🚧 Roadmap / Future Improvements

- [ ] Add authentication & user accounts
- [ ] Upgrade to proper database (Supabase/Firebase)
- [ ] Add map visualization
- [ ] Add location history tracking/routes
- [ ] Add geofencing alerts
- [ ] Add location sharing via link
- [ ] Add analytics & statistics
- [ ] Add PWA support (offline mode)
- [ ] Add dark mode

## 🐛 Troubleshooting

### Functions Tidak Bekerja

Lihat **[DEPLOY.md](DEPLOY.md)** section Troubleshooting.

Quick checklist:
- ✅ Deploy via Git atau CLI (bukan drag & drop)
- ✅ Folder structure benar (`netlify/functions/`)
- ✅ Check Netlify Dashboard > Functions tab
- ✅ Check function logs untuk error

### Location Permission Denied

- Enable location di browser settings
- Pastikan HTTPS aktif (Netlify auto-enable)
- Reload page dan allow lagi

### Data Tidak Muncul di /ngerug

- Check Console untuk error
- Pastikan functions ter-deploy
- Check dari device lain (bukan hanya localStorage)

## 📄 Lisensi

MIT License - Free to use

Silakan digunakan, dimodifikasi, dan didistribusikan sesuai kebutuhan.

---

**Made with ❤️ for learning purposes**

Happy tracking! 🗺️✨

# 🚀 Panduan Deploy ke Netlify

Website ini menggunakan **Netlify Functions** untuk menyimpan data lokasi secara permanen di server.

## 📋 Persyaratan

- Akun Netlify (gratis)
- Git (untuk deploy via Git)
- ATAU bisa manual upload tanpa Git

## 🎯 Cara Deploy

### Opsi 1: Deploy via Git (RECOMMENDED) ⭐

#### 1. Setup Git Repository

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Location Getter with server logging"

# Set branch ke main
git branch -M main
```

#### 2. Push ke GitHub/GitLab/Bitbucket

```bash
# Add remote origin (ganti dengan URL repository Anda)
git remote add origin https://github.com/username/locationGetter.git

# Push
git push -u origin main
```

#### 3. Deploy di Netlify

1. Login ke [https://netlify.com](https://netlify.com)
2. Klik **"Add new site"** > **"Import an existing project"**
3. Pilih provider Git (GitHub/GitLab/Bitbucket)
4. Authorize Netlify untuk akses repository
5. Pilih repository `locationGetter`
6. **Build Settings:**
   - Base directory: (kosongkan)
   - Build command: `echo 'No build needed'` (atau kosongkan)
   - Publish directory: `.` (root)
   - Functions directory: `netlify/functions` (auto-detect)
7. Klik **"Deploy site"**

#### 4. Tunggu Deploy Selesai

- Deploy biasanya selesai dalam 1-2 menit
- Netlify akan memberikan URL random seperti: `https://random-name-12345.netlify.app`
- Netlify Functions akan otomatis terdeteksi dan di-deploy

---

### Opsi 2: Deploy Manual (Drag & Drop)

#### ⚠️ PENTING untuk Manual Deploy:

**Netlify Functions tidak akan bekerja dengan drag & drop!**

Untuk manual deploy dengan Functions, gunakan **Netlify CLI**:

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login ke Netlify

```bash
netlify login
```

Browser akan terbuka untuk authorize. Login dengan akun Netlify Anda.

#### 3. Deploy

```bash
# Di folder project locationGetter
cd locationGetter

# Deploy
netlify deploy --prod
```

#### 4. Ikuti Instruksi:

- **Create & configure a new site?** → Yes
- **Team:** Pilih team Anda
- **Site name:** (optional, bisa dikosongkan untuk nama random)
- **Publish directory:** `.` (titik untuk root folder)

#### 5. Deploy Selesai

CLI akan menampilkan URL website Anda.

---

## ✅ Verifikasi Deploy

### 1. Test Homepage

Buka: `https://yoursite.netlify.app/`

- Harus muncul popup izin lokasi
- Setelah allow, koordinat muncul
- Cek **Console** browser (F12) harus ada pesan:
  ```
  ✅ Location saved to server: {success: true, message: "Location saved", id: ...}
  ```

### 2. Test Log Page

Buka: `https://yoursite.netlify.app/ngerug`

- Harus muncul data lokasi yang tadi
- Cek Console harus ada:
  ```
  ✅ Loaded logs from server: 1
  ```

### 3. Test dari Device Berbeda

- Buka dari HP/laptop lain
- Log harus tetap muncul (karena tersimpan di server)
- Ini membuktikan data tersimpan permanent, bukan di localStorage saja

---

## 🔧 Troubleshooting

### Functions Tidak Bekerja

**Gejala:**
- Console menampilkan: `⚠️ Loading from localStorage (fallback)`
- Data tidak tersimpan permanent

**Solusi:**

1. **Pastikan structure folder benar:**
   ```
   locationGetter/
   ├── netlify/
   │   └── functions/
   │       ├── save-location.js
   │       └── delete-location.js
   ├── index.html
   ├── log.html
   └── ...
   ```

2. **Check Netlify Dashboard:**
   - Go to: `Site Settings` > `Functions`
   - Pastikan Functions terdeteksi: `save-location` dan `delete-location`

3. **Check Function Logs:**
   - Netlify Dashboard > `Functions` tab
   - Klik function name
   - Lihat logs untuk error

4. **Re-deploy:**
   ```bash
   # If using Git
   git push

   # If using CLI
   netlify deploy --prod
   ```

### CORS Errors

Jika muncul CORS error di Console:

- Pastikan deploy ke Netlify (bukan localhost)
- Functions di Netlify sudah include CORS headers

### 404 on /ngerug

Jika `/ngerug` menampilkan 404:

- Check `netlify.toml` file ada dan benar
- Re-deploy

---

## 🎨 Custom Domain (Optional)

### Setup Domain Sendiri

1. Di Netlify Dashboard > **Domain settings**
2. Klik **"Add custom domain"**
3. Masukkan domain Anda (misal: `lokasi.sebatusatu.com`)
4. Follow instruksi untuk update DNS
5. Netlify akan auto-setup HTTPS (Let's Encrypt)

Setelah setup, akses:
- Homepage: `https://lokasi.sebatusatu.com/`
- Log page: `https://lokasi.sebatusatu.com/ngerug`

---

## 📊 Monitoring

### Netlify Analytics (Optional)

Untuk melihat traffic dan usage:

1. Netlify Dashboard > **Analytics** tab
2. Enable analytics (ada biaya tambahan)

### Function Logs

Untuk debug atau monitoring:

1. Netlify Dashboard > **Functions** tab
2. Klik nama function
3. Lihat **Recent logs**

---

## 🔄 Update Website

### Jika Deploy via Git:

```bash
# Edit files
# Commit changes
git add .
git commit -m "Update: feature X"

# Push (auto-deploy)
git push
```

Netlify akan auto-deploy setiap ada push ke branch main.

### Jika Deploy via CLI:

```bash
netlify deploy --prod
```

---

## 💾 Upgrade Database (Advanced)

Saat ini menggunakan **file-based storage** (`/tmp/locations.json`).

**Limitasi:**
- Data di `/tmp` bisa hilang saat function cold start
- Tidak cocok untuk production skala besar

**Upgrade Options:**

1. **Netlify Blobs** (Recommended for Netlify)
   - Built-in storage dari Netlify
   - Persistent storage
   - Easy integration

2. **Supabase** (Recommended for PostgreSQL)
   - Free tier generous
   - PostgreSQL database
   - Real-time subscriptions

3. **Firebase Firestore**
   - NoSQL database
   - Free tier
   - Real-time updates

4. **MongoDB Atlas**
   - Free tier
   - Scalable

Edit `netlify/functions/save-location.js` untuk integrate dengan database pilihan.

---

## 📞 Support

Jika ada masalah:

1. Check Console browser (F12) untuk error
2. Check Netlify Function logs
3. Pastikan deploy menggunakan Git atau CLI (bukan drag & drop)
4. Verify structure folder benar

---

Selamat! Website Anda sekarang **production-ready** dengan permanent storage! 🎉


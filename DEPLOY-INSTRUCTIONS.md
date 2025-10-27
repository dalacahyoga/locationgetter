# 🚀 Panduan Deploy - Persistent Storage Edition

## ✅ Perubahan Penting

Aplikasi ini sekarang menggunakan **Netlify Blobs** untuk persistent storage yang **100% aman dan reliable**!

### Perbedaan dengan Versi Sebelumnya:

| Aspek | ❌ Sebelumnya (`/tmp`) | ✅ Sekarang (Netlify Blobs) |
|-------|----------------------|---------------------------|
| **Persistence** | Data hilang random | **Data permanent** |
| **Cold Start** | Data hilang | **Data tetap ada** |
| **Redeploy** | Data hilang | **Data tetap ada** |
| **Reliability** | ⚠️ Tidak reliable | ✅ **100% Reliable** |

---

## 📋 Langkah Deploy

### 1️⃣ Install Dependencies

```bash
npm install
```

Ini akan menginstall `@netlify/blobs` yang diperlukan untuk persistent storage.

### 2️⃣ Commit Changes

```bash
git add .
git commit -m "Upgrade to Netlify Blobs persistent storage"
git push origin main
```

### 3️⃣ Deploy ke Netlify

**Option A: Auto Deploy via Git (Recommended)**

Jika sudah connect ke Git repository, Netlify akan **auto-deploy** setelah push.

**Option B: Manual Deploy via CLI**

```bash
netlify deploy --prod
```

---

## ✅ Verifikasi Deploy

### 1. Check Functions

1. Login ke Netlify Dashboard
2. Pilih site Anda
3. Klik tab **Functions**
4. Pastikan ada:
   - ✅ `save-location`
   - ✅ `delete-location`

### 2. Check Dependencies

Di Netlify Dashboard → **Deploys** → klik deploy terbaru → **Deploy log**

Pastikan terlihat:
```
Installing dependencies from package.json
@netlify/blobs@^7.0.0
```

### 3. Test Functionality

#### Test 1: Save Location
1. Buka `https://yoursite.netlify.app/`
2. Allow location permission
3. Buka Console (F12)
4. Pastikan ada: `✅ Also saved to server`

#### Test 2: View Logs
1. Buka `https://yoursite.netlify.app/ngerug`
2. Pastikan log muncul
3. Console harus menunjukkan: `✅ Loaded logs from server`

#### Test 3: Persistent Data
1. Clear browser cache
2. Buka dari device lain
3. Data **HARUS tetap ada** (ini bukti storage persistent!)

#### Test 4: After Redeploy
1. Trigger redeploy di Netlify Dashboard
2. Tunggu deploy selesai
3. Check `/ngerug` page
4. Data **HARUS tetap ada** (tidak hilang seperti sebelumnya!)

---

## 🔧 Troubleshooting

### Issue: Functions tidak muncul di Dashboard

**Penyebab:** Deploy method salah

**Solution:**
- ❌ JANGAN gunakan drag & drop
- ✅ GUNAKAN Git deploy atau CLI deploy

### Issue: Error `Cannot find module '@netlify/blobs'`

**Penyebab:** Dependencies tidak terinstall

**Solution:**
```bash
# Di local
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Issue: Data masih hilang setelah redeploy

**Penyebab:** Masih menggunakan versi lama

**Solution:**
1. Check `netlify/functions/save-location.js`
2. Pastikan baris pertama adalah:
   ```javascript
   const { getStore } = require('@netlify/blobs');
   ```
3. Jika masih `const fs = require('fs')`, berarti code belum ter-update

---

## 📊 Monitoring

### Check Function Logs

Netlify Dashboard → Functions → `save-location` → **View logs**

**Expected logs:**
```
✓ GET request - returning X locations
✓ POST request - saving new location
```

**Error logs to watch:**
```
❌ Cannot find module '@netlify/blobs'  → dependencies issue
❌ store.get is not a function          → version issue
```

### Check Blobs Storage

Netlify Dashboard → **Blobs** tab (jika tersedia di plan Anda)

Atau via CLI:
```bash
netlify blobs:list
```

---

## 🎯 Next Steps

Setelah deploy berhasil:

1. ✅ Test semua functionality
2. ✅ Verify data persists after redeploy
3. ✅ Test from multiple devices
4. ✅ Monitor function logs
5. (Optional) Add authentication untuk security

---

## 💡 Tips

### Backup Data

Meskipun Netlify Blobs persistent, tetap good practice untuk backup:

1. Buka `/ngerug`
2. Klik **Export JSON**
3. Save file secara regular

### Monitor Usage

Netlify Blobs free tier limits:
- Storage: Generous free tier
- Bandwidth: Generous free tier

Check usage di Netlify Dashboard → **Billing & usage**

---

## 🆘 Need Help?

Jika masih ada issue setelah deploy:

1. Check function logs di Netlify Dashboard
2. Check browser console untuk errors
3. Verify `@netlify/blobs` terinstall di package.json
4. Try manual redeploy

---

**Last Updated:** 2025-10-28
**Version:** 2.0 (Persistent Storage)


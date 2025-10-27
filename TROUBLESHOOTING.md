# 🔧 Troubleshooting - Data Tidak Tersimpan

## Langkah Debugging

### 1. Buka Website dan Console Browser

1. Buka: `https://yoursite.netlify.app/`
2. Tekan **F12** (atau klik kanan → Inspect)
3. Pilih tab **Console**
4. Refresh halaman
5. Allow location ketika popup muncul
6. Lihat pesan di Console

### Pesan yang HARUS muncul:

**✅ BERHASIL:**
```
📍 Location tracked silently
✅ Location saved to server: {success: true, message: "Location saved", id: 1730...}
```

**❌ GAGAL - Function tidak ditemukan:**
```
POST https://yoursite.netlify.app/.netlify/functions/save-location 404 (Not Found)
Failed to save log to server: Failed to fetch
```

**❌ GAGAL - CORS Error:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**❌ GAGAL - Function Error:**
```
POST https://yoursite.netlify.app/.netlify/functions/save-location 500 (Internal Server Error)
```

---

## Common Issues & Solutions

### Issue 1: 404 - Function Not Found

**Penyebab:** Netlify Functions tidak ter-deploy

**Solution:**

1. **Check Netlify Dashboard:**
   - Login ke netlify.com
   - Pilih site Anda
   - Klik tab **Functions**
   - Pastikan ada `save-location` dan `delete-location`

2. **Jika Functions tidak ada:**
   
   Re-deploy dengan struktur yang benar:
   
   ```
   locationgetter/
   ├── netlify/
   │   └── functions/
   │       ├── save-location.js
   │       └── delete-location.js
   ├── netlify.toml
   └── ...
   ```

3. **Check netlify.toml:**
   
   File harus berisi:
   ```toml
   [build]
     functions = "netlify/functions"
   ```

4. **Re-deploy:**
   ```bash
   git add .
   git commit -m "Fix functions structure"
   git push
   ```

---

### Issue 2: Function Error 500

**Penyebab:** Error di function code

**Solution:**

1. **Check Function Logs:**
   - Netlify Dashboard → Functions → `save-location`
   - Klik "View logs"
   - Lihat error message

2. **Common errors:**
   - `fs` module issues
   - JSON parsing errors
   - Missing permissions

---

### Issue 3: Silent Fail (No Error)

**Penyebab:** JavaScript error atau location blocked

**Solution:**

1. **Check Console for errors**
2. **Check browser location settings:**
   - Chrome: Settings → Privacy and security → Site Settings → Location
   - Pastikan site allowed

---

### Issue 4: Data Tersimpan tapi Hilang

**Status:** ✅ **FIXED!** (Updated to Netlify Blobs)

**Old Problem:** `/tmp` storage di Netlify Functions tidak persistent

**Solution:** Aplikasi ini sekarang menggunakan **Netlify Blobs** - persistent storage yang TIDAK AKAN HILANG!
- ✅ Data tetap ada saat function cold start
- ✅ Data tetap ada saat redeploy
- ✅ Data tersimpan permanent sampai dihapus manual

Jika masih mengalami issue ini, pastikan:
1. Deploy dengan versi terbaru yang menggunakan `@netlify/blobs`
2. Run `npm install` sebelum deploy
3. Check bahwa `@netlify/blobs` ada di `package.json`

---

## Quick Test Functions

### Test 1: Function Accessible?

Buka di browser:
```
https://yoursite.netlify.app/.netlify/functions/save-location
```

**Expected response (GET request):**
```json
{"error":"Method not allowed"}
```

Jika dapat 404 → Functions tidak ter-deploy!

---

### Test 2: Manual POST Test

Gunakan curl atau Postman:

```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/save-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -8.5,
    "longitude": 115.2,
    "accuracy": 20,
    "timestamp": 1730000000000,
    "userAgent": "Test",
    "platform": "Test"
  }'
```

**Expected:**
```json
{"success":true,"message":"Location saved","id":1730000000000}
```

---

### Test 3: Check if Data Saved

1. POST data via curl (above)
2. Open `/ngerug`
3. Should see test entry

---

## Alternative: Check Network Tab

1. F12 → Network tab
2. Refresh page
3. Allow location
4. Filter: `save-location`
5. Click the request
6. Check:
   - Status code
   - Response
   - Request payload

---

## Known Limitations

### ✅ Storage - SOLVED!

**Status:** Aplikasi sekarang menggunakan **Netlify Blobs** untuk persistent storage!

**Previous Problem (FIXED):** `/tmp` storage yang tidak persistent
**Current Solution:** Netlify Blobs - data tersimpan permanent dan tidak akan hilang

### Benefits Netlify Blobs:
- ✅ **Persistent** - data tidak hilang saat cold start atau redeploy
- ✅ **Free tier** - gratis untuk penggunaan normal
- ✅ **Fast** - built-in di Netlify infrastructure
- ✅ **Simple** - tidak perlu setup database eksternal
- ✅ **Reliable** - managed by Netlify

### Optional: Upgrade to Advanced Database

Jika butuh fitur advanced (analytics, complex queries, dll), bisa upgrade ke:

### Option 1: Supabase (Free PostgreSQL)

1. Create account: supabase.com
2. Create project
3. Update functions to use Supabase client

### Option 2: Firebase Firestore

1. Create Firebase project
2. Setup Firestore
3. Update functions

---

## Contact for Help

If still not working, provide:

1. **Console screenshot**
2. **Network tab screenshot**
3. **Netlify site URL**
4. **Function logs from Netlify Dashboard**

---

**Last Updated:** 2025-10-28


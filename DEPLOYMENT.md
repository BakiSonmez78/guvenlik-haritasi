# 🚀 GitHub + Render.com Deployment Kılavuzu

Bu kılavuz, Güvenlik Haritası uygulamanızı GitHub'a yükleyip Render.com'da yayınlamanız için adım adım talimatlar içerir.

---

## 📋 Gereksinimler

- ✅ GitHub hesabı (ücretsiz)
- ✅ Render.com hesabı (ücretsiz)
- ✅ MongoDB Atlas hesabı (ücretsiz)
- ✅ Google Maps API Key

---

## 1️⃣ GitHub'a Yükleme

### Adım 1: GitHub'da Yeni Repository Oluşturun

1. **GitHub'a gidin:** https://github.com
2. **Giriş yapın** (hesabınız yoksa kayıt olun)
3. **Sağ üstte "+" işaretine** tıklayın
4. **"New repository"** seçin
5. **Repository bilgilerini doldurun:**
   ```
   Repository name: guvenlik-haritasi
   Description: Topluluk güvenlik bilgilendirme uygulaması
   Public/Private: Public (veya Private)
   ✅ Add a README file: HAYIR (zaten var)
   ```
6. **"Create repository"** tıklayın

### Adım 2: Git Remote Ekleyin

GitHub'da oluşturduğunuz repo'nun URL'ini kopyalayın (örnek: `https://github.com/USERNAME/guvenlik-haritasi.git`)

**Terminal'de çalıştırın:**

```powershell
# GitHub repo URL'inizi buraya yazın
git remote add origin https://github.com/YOUR_USERNAME/guvenlik-haritasi.git

# Branch'i main olarak ayarlayın
git branch -M main

# GitHub'a push edin
git push -u origin main
```

**İlk push için GitHub kullanıcı adı ve token isteyecek:**
- Username: GitHub kullanıcı adınız
- Password: **Personal Access Token** (şifre değil!)

### Adım 3: GitHub Personal Access Token Oluşturun (Gerekirse)

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Scope: `repo` seçin
5. Token'ı kopyalayın ve güvenli bir yere kaydedin
6. Git push yaparken şifre yerine bu token'ı kullanın

✅ **GitHub'a yükleme tamamlandı!**

---

## 2️⃣ MongoDB Atlas Kurulumu

### Adım 1: Hesap Oluşturun

1. **MongoDB Atlas'a gidin:** https://www.mongodb.com/cloud/atlas
2. **"Try Free"** tıklayın
3. **Hesap oluşturun** (Google ile giriş yapabilirsiniz)

### Adım 2: Cluster Oluşturun

1. **"Create a Deployment"** tıklayın
2. **FREE tier** seçin (M0 Sandbox)
3. **Provider:** AWS
4. **Region:** Frankfurt (Europe) - Türkiye'ye en yakın
5. **Cluster Name:** guvenlik-haritasi
6. **"Create Deployment"** tıklayın

### Adım 3: Database User Oluşturun

1. **Security → Database Access**
2. **"Add New Database User"** tıklayın
3. **Authentication Method:** Password
4. **Username:** `admin` (veya istediğiniz)
5. **Password:** Güçlü bir şifre oluşturun (kaydedin!)
6. **Database User Privileges:** Read and write to any database
7. **"Add User"** tıklayın

### Adım 4: Network Access Ayarlayın

1. **Security → Network Access**
2. **"Add IP Address"** tıklayın
3. **"Allow Access from Anywhere"** seçin (0.0.0.0/0)
4. **"Confirm"** tıklayın

⚠️ **Güvenlik Notu:** Production'da sadece Render.com IP'lerini ekleyin.

### Adım 5: Connection String Alın

1. **Database → Connect** tıklayın
2. **"Connect your application"** seçin
3. **Driver:** Node.js
4. **Version:** 5.5 or later
5. **Connection string'i kopyalayın:**
   ```
   mongodb+srv://admin:<password>@guvenlik-haritasi.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **`<password>`** kısmını gerçek şifrenizle değiştirin

✅ **MongoDB Atlas hazır!**

---

## 3️⃣ Render.com Deployment

### Adım 1: Hesap Oluşturun

1. **Render.com'a gidin:** https://render.com
2. **"Get Started"** tıklayın
3. **GitHub ile giriş yapın** (önerilir)
4. **Render'a GitHub erişimi verin**

### Adım 2: Web Service Oluşturun

1. **Dashboard → "New +"** tıklayın
2. **"Web Service"** seçin
3. **GitHub repository'nizi seçin:** `guvenlik-haritasi`
4. **Ayarları yapın:**

```
Name: guvenlik-haritasi
Region: Frankfurt (EU Central)
Branch: main
Root Directory: (boş bırakın)
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Adım 3: Environment Variables Ekleyin

**"Advanced"** butonuna tıklayın ve şu değişkenleri ekleyin:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@guvenlik-haritasi.xxxxx.mongodb.net/guvenlik-haritasi?retryWrites=true&w=majority
JWT_SECRET=super-secret-production-key-change-this-to-random-string-12345
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
CORS_ORIGIN=https://guvenlik-haritasi.onrender.com
```

⚠️ **Önemli:**
- `MONGODB_URI`: MongoDB Atlas connection string'inizi yapıştırın
- `JWT_SECRET`: Güçlü, rastgele bir string kullanın (32+ karakter)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key'inizi yapıştırın
- `CORS_ORIGIN`: Render URL'iniz (deploy sonrası güncelleyebilirsiniz)

### Adım 4: Deploy Edin

1. **"Create Web Service"** tıklayın
2. **Deploy başlayacak** (5-10 dakika sürebilir)
3. **Logs'u izleyin** (hata varsa göreceksiniz)

### Adım 5: URL'inizi Alın

Deploy tamamlandığında:
```
https://guvenlik-haritasi.onrender.com
```

✅ **Backend API hazır!**

---

## 4️⃣ Frontend'i Güncelleme

### Adım 1: API URL'ini Güncelleyin

`public/index.html` dosyasını açın ve en alta ekleyin:

```html
<script>
    // API Configuration
    const API_URL = 'https://guvenlik-haritasi.onrender.com/api';
    const SOCKET_URL = 'https://guvenlik-haritasi.onrender.com';
</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="app.js"></script>
```

### Adım 2: app.js'i Güncelleyin

`public/app.js` dosyasının başına ekleyin:

```javascript
// API Configuration (from index.html)
const API_BASE_URL = window.API_URL || 'http://localhost:5000/api';
const SOCKET_BASE_URL = window.SOCKET_URL || 'http://localhost:5000';
```

### Adım 3: GitHub'a Push Edin

```powershell
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Render otomatik olarak yeniden deploy edecek.

---

## 5️⃣ Test Etme

### Backend Test:

```
https://guvenlik-haritasi.onrender.com/api/health
```

Şu yanıtı almalısınız:
```json
{
  "status": "OK",
  "timestamp": "2026-01-17T...",
  "uptime": 123,
  "environment": "production"
}
```

### Frontend Test:

```
https://guvenlik-haritasi.onrender.com
```

Uygulama açılmalı!

---

## 6️⃣ Veritabanını İlklendirme (İsteğe Bağlı)

Render Dashboard'da:

1. **Web Service'inizi seçin**
2. **"Shell"** sekmesine gidin
3. **Şu komutu çalıştırın:**
   ```bash
   npm run init-db
   ```

Bu komut örnek mahalle ve olay verileri ekleyecek.

---

## 🎉 Tamamlandı!

Uygulamanız artık internette yayında! 🚀

### Erişim Linkleri:

- **Frontend:** https://guvenlik-haritasi.onrender.com
- **Backend API:** https://guvenlik-haritasi.onrender.com/api
- **Health Check:** https://guvenlik-haritasi.onrender.com/api/health

---

## 🔧 Sorun Giderme

### Deploy Başarısız Olursa:

1. **Logs'u kontrol edin** (Render Dashboard → Logs)
2. **Environment variables'ı kontrol edin**
3. **MongoDB connection string'i doğru mu?**
4. **package.json'da "start" script'i var mı?**

### MongoDB Bağlantı Hatası:

```
MongoServerError: bad auth
```
**Çözüm:** MongoDB Atlas'ta user ve password'ü kontrol edin.

### CORS Hatası:

```
Access to fetch has been blocked by CORS
```
**Çözüm:** `CORS_ORIGIN` environment variable'ını kontrol edin.

---

## 📊 Render.com Ücretsiz Plan Limitleri

- ✅ **750 saat/ay** çalışma süresi
- ✅ **512 MB RAM**
- ✅ **Otomatik SSL** (HTTPS)
- ⚠️ **15 dakika inaktivite sonrası uyku modu** (ilk istek 30 saniye sürebilir)

**Pro İpucu:** Uygulamanızı aktif tutmak için cron job kullanabilirsiniz.

---

## 🚀 Sonraki Adımlar

1. ✅ **Custom Domain** bağlayın (Render Settings → Custom Domain)
2. ✅ **SSL Sertifikası** otomatik aktif
3. ✅ **Monitoring** ekleyin (Sentry, LogRocket)
4. ✅ **Analytics** ekleyin (Google Analytics)
5. ✅ **SEO** optimize edin

---

## 📝 Güncelleme Yapmak

Kod değişikliği yaptığınızda:

```powershell
git add .
git commit -m "Yeni özellik eklendi"
git push origin main
```

Render otomatik olarak yeniden deploy edecek!

---

**Başarılar! 🎉**

Sorularınız varsa bana sorun!

# 🛡️ Güvenlik Haritası - Kurulum Kılavuzu

Gerçek bir production uygulaması olarak çalıştırmak için adım adım kılavuz.

## 📋 Gereksinimler

### Yazılım
- ✅ **Node.js** 16 veya üzeri ([İndir](https://nodejs.org/))
- ✅ **MongoDB** 5.0 veya üzeri ([İndir](https://www.mongodb.com/try/download/community))
- ✅ **Git** ([İndir](https://git-scm.com/))
- ✅ **Google Maps API Key** ([Al](https://developers.google.com/maps/documentation/javascript/get-api-key))

### Hesaplar (İsteğe Bağlı - Production için)
- MongoDB Atlas (Cloud database)
- Heroku veya Render.com (Deployment)

---

## 🚀 Hızlı Başlangıç (Local Development)

### 1. MongoDB'yi Başlatın

**Windows:**
```powershell
# MongoDB'yi başlatın (MongoDB kurulu olmalı)
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### 2. Backend'i Kurun ve Başlatın

```powershell
# Proje dizinine gidin
cd c:\Users\Baki\.gemini\antigravity\playground\prime-equinox

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
copy .env.example .env

# .env dosyasını düzenleyin (Notepad ile)
notepad .env
```

**.env dosyasında değiştirin:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/guvenlik-haritasi
JWT_SECRET=super-secret-key-change-this-12345
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
CORS_ORIGIN=http://localhost:3000
```

**Backend'i başlatın:**
```powershell
npm run dev
```

✅ Backend `http://localhost:5000` adresinde çalışacak

### 3. Frontend'i Hazırlayın

**public klasörü oluşturun ve dosyaları taşıyın:**
```powershell
# public klasörü oluşturun
mkdir public

# Mevcut HTML, CSS, JS dosyalarını public'e taşıyın
move index.html public\
move styles.css public\
move app.js public\
```

**index.html'de API URL'ini güncelleyin:**
`public/index.html` dosyasının sonunda:
```html
<script>
    // API Configuration
    const API_URL = 'http://localhost:5000/api';
    const SOCKET_URL = 'http://localhost:5000';
</script>
<script src="app.js"></script>
```

### 4. Frontend'i Başlatın

**Yeni bir terminal açın:**
```powershell
# Frontend sunucusunu başlatın
npm run client
```

✅ Frontend `http://localhost:3000` adresinde çalışacak

### 5. Tarayıcıda Açın

`http://localhost:3000` adresine gidin ve uygulamayı kullanmaya başlayın!

---

## 🗄️ Veritabanını İlklendirme (İsteğe Bağlı)

Örnek mahalle ve veri eklemek için:

```powershell
npm run init-db
```

Bu komut:
- Örnek mahalleler ekler (İstanbul)
- Güvenlik skorlarını hesaplar
- Test verileri oluşturur

---

## 🌐 Production Deployment

### MongoDB Atlas (Cloud Database)

1. **Hesap Oluşturun:**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) adresine gidin
   - Ücretsiz hesap oluşturun

2. **Cluster Oluşturun:**
   - "Create a New Cluster" tıklayın
   - FREE tier seçin
   - Region: Europe (Frankfurt) önerilir

3. **Database User Oluşturun:**
   - Database Access → Add New Database User
   - Username ve password belirleyin

4. **Network Access Ayarlayın:**
   - Network Access → Add IP Address
   - "Allow Access from Anywhere" (0.0.0.0/0) seçin

5. **Connection String Alın:**
   - Clusters → Connect → Connect your application
   - Connection string'i kopyalayın
   - `.env` dosyasına ekleyin:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guvenlik-haritasi
   ```

### Render.com Deployment

1. **Hesap Oluşturun:**
   - [Render.com](https://render.com) adresine gidin
   - GitHub ile giriş yapın

2. **Web Service Oluşturun:**
   - Dashboard → New → Web Service
   - GitHub repo'nuzu bağlayın

3. **Ayarları Yapın:**
   ```
   Name: guvenlik-haritasi-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables Ekleyin:**
   ```
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secret-key
   GOOGLE_MAPS_API_KEY=your-api-key
   NODE_ENV=production
   ```

5. **Deploy Edin:**
   - "Create Web Service" tıklayın
   - Otomatik deploy başlayacak

6. **Frontend'i Güncelleyin:**
   `public/index.html` dosyasında:
   ```javascript
   const API_URL = 'https://your-app.onrender.com/api';
   const SOCKET_URL = 'https://your-app.onrender.com';
   ```

---

## 🔧 Sorun Giderme

### MongoDB Bağlantı Hatası
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Çözüm:** MongoDB servisinin çalıştığından emin olun:
```powershell
mongod
```

### Port Zaten Kullanımda
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Çözüm:** Portu değiştirin veya çalışan uygulamayı kapatın:
```powershell
# .env dosyasında PORT değiştirin
PORT=5001
```

### CORS Hatası
```
Access to fetch has been blocked by CORS policy
```
**Çözüm:** `.env` dosyasında CORS_ORIGIN'i kontrol edin:
```env
CORS_ORIGIN=http://localhost:3000
```

### Google Maps API Hatası
```
Google Maps JavaScript API error: InvalidKeyMapError
```
**Çözüm:** 
1. API key'inizi kontrol edin
2. API'leri etkinleştirin:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
   - Maps Visualization API

---

## 📊 API Test Etme

### Postman ile Test

1. **Health Check:**
```
GET http://localhost:5000/api/health
```

2. **Kayıt Ol:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

3. **Yakındaki Olaylar:**
```
GET http://localhost:5000/api/incidents/nearby?lat=41.0082&lng=28.9784&radius=5000
```

### cURL ile Test

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

---

## 📱 Mobil Uygulama (İsteğe Bağlı)

React Native veya Flutter ile mobil uygulama yapabilirsiniz:

### React Native
```bash
npx react-native init GuvenlikHaritasi
# API_URL'i backend URL'inize ayarlayın
```

### Flutter
```bash
flutter create guvenlik_haritasi
# API endpoint'lerini ayarlayın
```

---

## 🔐 Güvenlik Önerileri

### Production için:
1. ✅ Güçlü JWT_SECRET kullanın (32+ karakter)
2. ✅ HTTPS kullanın (Let's Encrypt ücretsiz)
3. ✅ Rate limiting etkinleştirin
4. ✅ Input validation yapın
5. ✅ MongoDB'de authentication aktif edin
6. ✅ Environment variables'ı asla commit etmeyin
7. ✅ Regular backup alın
8. ✅ Monitoring ekleyin (Sentry, LogRocket)

---

## 📚 Daha Fazla Bilgi

- [Backend API Dokümantasyonu](./SERVER_README.md)
- [Frontend Kullanım Kılavuzu](./README.md)
- [MongoDB Dokümantasyonu](https://docs.mongodb.com/)
- [Express.js Dokümantasyonu](https://expressjs.com/)
- [Socket.io Dokümantasyonu](https://socket.io/docs/)

---

## 🆘 Destek

Sorun yaşarsanız:
1. GitHub Issues açın
2. Logları kontrol edin
3. Dokümantasyonu okuyun

**Başarılar! 🚀**

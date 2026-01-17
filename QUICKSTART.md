# 🛡️ Güvenlik Haritası - Hızlı Başlangıç

## ⚡ En Hızlı Yol (3 Adım)

### 1️⃣ MongoDB'yi Başlatın
Yeni bir terminal açın:
```powershell
mongod
```
> MongoDB yüklü değilse: https://www.mongodb.com/try/download/community

### 2️⃣ Google Maps API Key Ekleyin
`.env` dosyasını açın ve API key'inizi ekleyin:
```env
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```
> API key almak için: https://developers.google.com/maps/documentation/javascript/get-api-key

**Önemli:** Aşağıdaki API'leri etkinleştirin:
- Maps JavaScript API
- Places API  
- Directions API
- Geocoding API
- Maps Visualization API

### 3️⃣ Uygulamayı Başlatın
```powershell
.\start.bat
```

**Veya manuel olarak:**
```powershell
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
npm run client
```

### 4️⃣ Tarayıcıda Açın
```
http://localhost:3000
```

---

## 📁 Proje Yapısı

```
prime-equinox/
├── public/              # Frontend dosyaları
│   ├── index.html      # Ana sayfa
│   ├── styles.css      # Stiller
│   └── app.js          # JavaScript
│
├── server/             # Backend API
│   ├── index.js        # Express server
│   ├── models/         # MongoDB modelleri
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & validation
│   └── scripts/        # Yardımcı scriptler
│
├── .env                # Environment variables
├── package.json        # Dependencies
└── start.bat           # Otomatik başlatma scripti
```

---

## 🎯 Özellikler

✅ **Suç Isı Haritası** - Gerçek zamanlı görselleştirme  
✅ **Mahalle Güvenlik Skorları** - 1-10 arası puanlama  
✅ **Detaylı İstatistikler** - Grafikler ve analizler  
✅ **Olay Bildirimi** - Anonim raporlama sistemi  
✅ **Güvenli Rota** - En güvenli yolu bulun  
✅ **Real-time Updates** - WebSocket ile anlık bildirimler  
✅ **KVKV/GDPR Uyumlu** - Gizlilik koruması  

---

## 🔧 Sorun Giderme

### MongoDB Bağlantı Hatası
```
Error: connect ECONNREFUSED
```
**Çözüm:** MongoDB'nin çalıştığından emin olun:
```powershell
mongod
```

### Port Kullanımda
```
Error: EADDRINUSE
```
**Çözüm:** `.env` dosyasında PORT değiştirin:
```env
PORT=5001
```

### Google Maps Hatası
```
InvalidKeyMapError
```
**Çözüm:**
1. API key'inizi kontrol edin
2. Gerekli API'leri etkinleştirin
3. Billing aktif olmalı (ücretsiz $200 kredi var)

---

## 📚 Dokümantasyon

- **Kurulum:** `SETUP_GUIDE.md`
- **Backend API:** `SERVER_README.md`  
- **Frontend:** `README.md`

---

## 🚀 Production Deployment

### MongoDB Atlas (Ücretsiz)
1. https://www.mongodb.com/cloud/atlas
2. FREE cluster oluştur
3. Connection string al
4. `.env` dosyasına ekle

### Render.com (Ücretsiz)
1. https://render.com
2. GitHub repo bağla
3. Environment variables ekle
4. Deploy et

---

## 💡 İpuçları

- **İlk kullanımda** veritabanını ilklendirin: `npm run init-db`
- **Development** için: `npm run dev:all` (her ikisini birden başlatır)
- **Logs** görmek için terminal'leri açık tutun
- **MongoDB Compass** kullanarak veritabanını görselleştirin

---

## 🆘 Yardım

Sorun mu yaşıyorsunuz?
1. `SETUP_GUIDE.md` dosyasını okuyun
2. Terminal loglarını kontrol edin
3. MongoDB'nin çalıştığından emin olun
4. `.env` dosyasını kontrol edin

---

**Başarılar! 🎉**

Uygulamanız hazır. Şimdi `http://localhost:3000` adresini açın ve test edin!

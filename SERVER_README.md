# Güvenlik Haritası - Production Backend

Full-stack güvenlik bilgilendirme uygulaması için Node.js backend API.

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+ 
- MongoDB 5.0+
- npm veya yarn

### Adım 1: Bağımlılıkları Yükle
```bash
npm install
```

### Adım 2: Environment Variables Ayarla
`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

Düzenleyin:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/guvenlik-haritasi
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### Adım 3: MongoDB'yi Başlatın
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### Adım 4: Veritabanını İlklendir (İsteğe Bağlı)
```bash
npm run init-db
```

### Adım 5: Sunucuyu Başlatın
```bash
# Development mode (nodemon ile)
npm run dev

# Production mode
npm start
```

Sunucu `http://localhost:5000` adresinde çalışacak.

## 📁 Proje Yapısı

```
server/
├── index.js              # Ana sunucu dosyası
├── models/               # MongoDB modelleri
│   ├── User.js          # Kullanıcı modeli
│   ├── Incident.js      # Olay raporu modeli
│   └── Neighborhood.js  # Mahalle modeli
├── routes/              # API route'ları
│   ├── auth.js         # Kimlik doğrulama
│   ├── incidents.js    # Olay raporları
│   ├── neighborhoods.js # Mahalle verileri
│   ├── stats.js        # İstatistikler
│   └── users.js        # Kullanıcı işlemleri
├── middleware/          # Middleware'ler
│   ├── auth.js         # JWT doğrulama
│   └── validation.js   # Input validation
└── scripts/            # Yardımcı scriptler
    └── initDatabase.js # DB initialization
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/guest` - Misafir girişi
- `GET /api/auth/verify` - Token doğrulama

### Incidents (Olaylar)
- `GET /api/incidents/nearby?lat=X&lng=Y&radius=5000` - Yakındaki olaylar
- `GET /api/incidents/heatmap?days=30` - Isı haritası verileri
- `POST /api/incidents` - Yeni olay bildir
- `POST /api/incidents/:id/vote` - Olay için oy kullan
- `GET /api/incidents/:id` - Olay detayı

### Neighborhoods (Mahalleler)
- `GET /api/neighborhoods` - Tüm mahalleler
- `GET /api/neighborhoods/by-location?lat=X&lng=Y` - Konuma göre mahalle
- `GET /api/neighborhoods/top-safe?limit=10` - En güvenli mahalleler
- `GET /api/neighborhoods/:id` - Mahalle detayı

### Statistics (İstatistikler)
- `GET /api/stats/overview?days=30` - Genel istatistikler
- `GET /api/stats/crime-types?days=30` - Suç türü dağılımı
- `GET /api/stats/time-analysis?days=30` - Zaman bazlı analiz
- `GET /api/stats/neighborhood-comparison` - Mahalle karşılaştırması
- `GET /api/stats/recent-incidents?limit=10` - Son olaylar

### Users (Kullanıcılar)
- `GET /api/users/profile` - Kullanıcı profili (auth gerekli)
- `PATCH /api/users/preferences` - Tercihleri güncelle (auth gerekli)
- `POST /api/users/location` - Konumu güncelle (auth gerekli)
- `POST /api/users/device-token` - Push notification token ekle (auth gerekli)

## 🔐 Authentication

API, JWT (JSON Web Token) kullanır. Token almak için:

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        name: 'Kullanıcı Adı'
    })
});

const { token } = await response.json();

// Use token in subsequent requests
fetch('http://localhost:5000/api/users/profile', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## 🔌 WebSocket Events

Socket.io ile real-time güncellemeler:

```javascript
const socket = io('http://localhost:5000');

// Konuma katıl
socket.emit('join-location', { lat: 41.0082, lng: 28.9784 });

// Yeni olay bildirimi al
socket.on('incident-alert', (data) => {
    console.log('Yeni olay:', data);
});

// Kullanıcı konum güncellemesi al
socket.on('user-location-update', (data) => {
    console.log('Kullanıcı konumu:', data);
});
```

## 🗄️ Database Models

### User
- Email, password (hashed)
- Role (user, moderator, admin)
- Preferences (notifications, privacy, alerts)
- Statistics (reports submitted, verified, helpful votes)
- Last location (geospatial)

### Incident
- Type (theft, suspicious, accident, harassment, other)
- Description
- Location (GeoJSON Point with 2dsphere index)
- Severity (low, medium, high)
- Status (pending, verified, resolved, rejected)
- Anonymous flag
- Upvotes/downvotes

### Neighborhood
- Name, city, district
- Bounds (GeoJSON Polygon)
- Safety score (0-10 with history and trend)
- Statistics (incidents by type, time, etc.)
- Population, area

## 🔒 Güvenlik

- ✅ Helmet.js - Security headers
- ✅ Rate limiting - DDoS koruması
- ✅ CORS - Cross-origin control
- ✅ JWT - Secure authentication
- ✅ bcrypt - Password hashing
- ✅ Input validation - XSS/injection koruması
- ✅ Data anonymization - Gizlilik koruması

## 📊 Gizlilik

Tüm konum verileri:
- 3 ondalık basamağa yuvarlanır (~111m hassasiyet)
- Anonim raporlar için kullanıcı bilgisi saklanmaz
- IP adresleri hash'lenir
- Kişisel veriler asla public API'de gösterilmez

## 🚀 Production Deployment

### MongoDB Atlas (Cloud Database)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Cluster oluşturun
3. Connection string'i `.env` dosyasına ekleyin

### Heroku Deployment
```bash
# Heroku CLI yükleyin
npm install -g heroku

# Login
heroku login

# Uygulama oluşturun
heroku create guvenlik-haritasi-api

# Environment variables ekleyin
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Render.com Deployment
1. [Render.com](https://render.com) hesabı oluşturun
2. "New Web Service" oluşturun
3. GitHub repo'nuzu bağlayın
4. Environment variables ekleyin
5. Deploy edin

## 📝 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

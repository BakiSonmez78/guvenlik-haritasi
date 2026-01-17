# 🛡️ Güvenlik Haritası - Güvenli Şehir Uygulaması

Modern, premium tasarımlı bir güvenlik bilgilendirme web uygulaması. Google Maps API kullanarak çevrenizdeki güvenlik noktalarını gösterir, güvenli rotalar oluşturur ve topluluk güvenlik raporlarını paylaşır.

## ✨ Özellikler

### 🔒 Gizlilik ve Güvenlik
- **KVKV/GDPR Uyumlu**: Açık rıza sistemi
- **Şifreli Veri**: Tüm konum verileri güvenli
- **Kullanıcı Kontrolü**: İstediğiniz zaman paylaşımı durdurabilirsiniz
- **Şeffaflık**: Açık gizlilik politikası

### 📍 Konum Özellikleri
- **Gerçek Zamanlı Konum**: Mavi nokta ile konumunuzu görün
- **Konum Paylaşımı**: Güvendiğiniz kişilerle paylaşın
- **Güvenli Rotalar**: En güvenli yolu bulun
- **Yakındaki Güvenlik Noktaları**: Polis, hastane, eczane

### 🗺️ Harita Katmanları
- 👮 **Polis Karakolu**: Acil durumlarda en yakın karakol
- 🏥 **Hastane**: Sağlık acil durumları için
- 💊 **Eczane**: Nöbetçi eczaneler
- 🏛️ **Güvenli Bölgeler**: Kamu binaları ve güvenli alanlar

### 📢 Topluluk Özellikleri
- **Olay Bildirimi**: Anonim veya isimli rapor gönderin
- **Gerçek Zamanlı Uyarılar**: Yakınınızdaki olaylardan haberdar olun
- **Topluluk Desteği**: Birlikte daha güvenli

### 🚨 Acil Durum
- **Hızlı Erişim**: Tek tıkla acil numaralara ulaşın
- **Konum Paylaşımı**: Acil servislere konumunuzu gönderin
- **Önemli Numaralar**: 155, 112, 110, 183

## 🚀 Kurulum

### 1. Google Maps API Anahtarı Alın

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun
3. "APIs & Services" > "Credentials" bölümüne gidin
4. "Create Credentials" > "API Key" seçin
5. Aşağıdaki API'leri etkinleştirin:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

### 2. API Anahtarını Ekleyin

`index.html` dosyasını açın ve `YOUR_API_KEY_HERE` kısmını kendi API anahtarınızla değiştirin:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=BURAYA_API_ANAHTARINIZI_YAPIŞTIRIN&libraries=places&callback=initMap"></script>
```

### 3. Uygulamayı Çalıştırın

#### Basit Yöntem (Python ile):
```bash
python -m http.server 8000
```

#### Node.js ile:
```bash
npx http-server -p 8000
```

#### VS Code Live Server ile:
1. Live Server eklentisini yükleyin
2. `index.html` dosyasına sağ tıklayın
3. "Open with Live Server" seçin

Tarayıcınızda `http://localhost:8000` adresini açın.

## 📱 Kullanım

### İlk Kullanım
1. Uygulama açıldığında gizlilik onay ekranı görünür
2. Konum izni için açık rıza verin
3. Tarayıcı konum izni isteyecek, "İzin Ver" seçin
4. Harita konumunuzla açılır

### Güvenlik Noktalarını Görüntüleme
- Sol panelden katmanları açıp kapatabilirsiniz
- Haritadaki işaretlere tıklayarak detayları görün
- "Yol Tarifi Al" butonu ile rota oluşturun

### Konum Paylaşımı
1. "Konumumu Paylaş" butonuna tıklayın
2. Konumunuz gerçek zamanlı olarak güncellenir
3. "Durdur" butonu ile paylaşımı sonlandırın

### Güvenli Rota Bulma
1. Sol panelden hedef adresinizi girin
2. "Güvenli Rota Bul" butonuna tıklayın
3. Haritada rota gösterilir
4. Sağ panelde mesafe ve süre bilgisi görünür

### Olay Bildirimi
1. "Olay Bildir" butonuna tıklayın
2. Olay türünü seçin
3. Açıklama yazın
4. Anonim veya isimli olarak gönderin

### Acil Durum
1. Sağ üstteki kırmızı "ACİL DURUM" butonuna tıklayın
2. Acil numaraları görün
3. Konumunuz otomatik olarak gösterilir
4. Numaraya tıklayarak direkt arayın

## 🎨 Tasarım Özellikleri

- **Modern Dark Theme**: Göz yormayan koyu tema
- **Glassmorphism**: Cam efektli modern tasarım
- **Smooth Animations**: Akıcı geçişler ve animasyonlar
- **Responsive Design**: Mobil, tablet ve masaüstü uyumlu
- **Premium UI**: Profesyonel kullanıcı arayüzü
- **Gradient Effects**: Canlı renk geçişleri
- **Custom Scrollbars**: Özel kaydırma çubukları

## 🔧 Teknolojiler

- **HTML5**: Semantik yapı
- **CSS3**: Modern stillemeler
  - CSS Grid & Flexbox
  - CSS Variables
  - Animations & Transitions
  - Glassmorphism
- **JavaScript (ES6+)**: 
  - Google Maps JavaScript API
  - Geolocation API
  - Local Storage
  - Event Handling
- **Google Maps APIs**:
  - Maps JavaScript API
  - Directions API
  - Geocoding API
  - Places API

## 📊 Veri Gizliliği

### Toplanan Veriler
- Konum bilgisi (sadece izin verdiğinizde)
- Olay raporları (anonim olabilir)
- Tercihler (yerel depolama)

### Veri Kullanımı
- Sadece güvenlik hizmetleri için
- Üçüncü taraflarla paylaşılmaz
- İstediğiniz zaman silebilirsiniz

### Haklarınız (KVKV)
- ✅ Verilerinize erişim hakkı
- ✅ Verilerin silinmesini talep etme
- ✅ İzni geri çekme
- ✅ Veri taşınabilirliği

## 🌐 Tarayıcı Desteği

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 📝 Önemli Notlar

### Güvenlik
- Bu uygulama **bilgilendirme amaçlıdır**
- Gerçek acil durumlarda **direkt 112'yi arayın**
- Kişisel güvenliğiniz her zaman önceliklidir

### Yasal Uyarı
- Uygulama KVKV ve GDPR uyumludur
- Kullanıcı verileri korunur
- Açık rıza sistemi kullanılır
- Kişilerin izinsiz takibi **yasaktır**

### API Maliyetleri
- Google Maps API kullanımı ücretlidir
- Aylık $200 ücretsiz kredi vardır
- Yüksek kullanımda ücret uygulanabilir
- [Fiyatlandırma detayları](https://cloud.google.com/maps-platform/pricing)

## 🚀 Geliştirme Fikirleri

- [ ] Firebase entegrasyonu (gerçek zamanlı veri)
- [ ] Push notifications (acil uyarılar)
- [ ] Kullanıcı hesapları
- [ ] Arkadaş sistemi
- [ ] Güvenli bölge ısı haritası
- [ ] Offline mod
- [ ] PWA desteği (mobil uygulama gibi)
- [ ] Çoklu dil desteği
- [ ] Dark/Light tema geçişi

## 📄 Lisans

Bu proje eğitim ve bilgilendirme amaçlıdır. Ticari kullanım için Google Maps API lisans koşullarını kontrol edin.

## 🤝 Katkıda Bulunma

Önerileriniz ve katkılarınız için teşekkür ederiz!

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- Pull Requests

---

**⚠️ Önemli**: Bu uygulama bir demo/prototiptir. Gerçek acil durumlarda her zaman resmi acil servis numaralarını arayın.

**🛡️ Güvenliğiniz bizim önceliğimizdir!**

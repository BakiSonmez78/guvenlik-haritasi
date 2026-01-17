const mongoose = require('mongoose');
const Neighborhood = require('../models/Neighborhood');
const Incident = require('../models/Incident');
require('dotenv').config();

// Sample Istanbul neighborhoods with realistic boundaries
const sampleNeighborhoods = [
    {
        name: 'Beyoğlu',
        city: 'İstanbul',
        district: 'Beyoğlu',
        center: {
            type: 'Point',
            coordinates: [28.9784, 41.0370]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [28.9684, 41.0270],
                [28.9884, 41.0270],
                [28.9884, 41.0470],
                [28.9684, 41.0470],
                [28.9684, 41.0270]
            ]]
        },
        population: 245000,
        area: 8.76
    },
    {
        name: 'Kadıköy',
        city: 'İstanbul',
        district: 'Kadıköy',
        center: {
            type: 'Point',
            coordinates: [29.0320, 40.9900]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [29.0220, 40.9800],
                [29.0420, 40.9800],
                [29.0420, 41.0000],
                [29.0220, 41.0000],
                [29.0220, 40.9800]
            ]]
        },
        population: 450000,
        area: 25.0
    },
    {
        name: 'Şişli',
        city: 'İstanbul',
        district: 'Şişli',
        center: {
            type: 'Point',
            coordinates: [28.9875, 41.0602]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [28.9775, 41.0502],
                [28.9975, 41.0502],
                [28.9975, 41.0702],
                [28.9775, 41.0702],
                [28.9775, 41.0502]
            ]]
        },
        population: 280000,
        area: 9.2
    },
    {
        name: 'Beşiktaş',
        city: 'İstanbul',
        district: 'Beşiktaş',
        center: {
            type: 'Point',
            coordinates: [29.0050, 41.0420]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [28.9950, 41.0320],
                [29.0150, 41.0320],
                [29.0150, 41.0520],
                [28.9950, 41.0520],
                [28.9950, 41.0320]
            ]]
        },
        population: 190000,
        area: 18.0
    },
    {
        name: 'Üsküdar',
        city: 'İstanbul',
        district: 'Üsküdar',
        center: {
            type: 'Point',
            coordinates: [29.0233, 41.0225]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [29.0133, 41.0125],
                [29.0333, 41.0125],
                [29.0333, 41.0325],
                [29.0133, 41.0325],
                [29.0133, 41.0125]
            ]]
        },
        population: 540000,
        area: 35.9
    },
    {
        name: 'Fatih',
        city: 'İstanbul',
        district: 'Fatih',
        center: {
            type: 'Point',
            coordinates: [28.9497, 41.0186]
        },
        bounds: {
            type: 'Polygon',
            coordinates: [[
                [28.9397, 41.0086],
                [28.9597, 41.0086],
                [28.9597, 41.0286],
                [28.9397, 41.0286],
                [28.9397, 41.0086]
            ]]
        },
        population: 420000,
        area: 15.6
    }
];

async function initDatabase() {
    try {
        console.log('🔌 MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guvenlik-haritasi');
        console.log('✅ MongoDB bağlantısı başarılı\n');

        // Clear existing data
        console.log('🗑️  Mevcut veriler temizleniyor...');
        await Neighborhood.deleteMany({});
        await Incident.deleteMany({});
        console.log('✅ Veriler temizlendi\n');

        // Insert neighborhoods
        console.log('📍 Mahalleler ekleniyor...');
        const neighborhoods = await Neighborhood.insertMany(sampleNeighborhoods);
        console.log(`✅ ${neighborhoods.length} mahalle eklendi\n`);

        // Generate sample incidents
        console.log('📊 Örnek olaylar oluşturuluyor...');
        const incidents = [];
        const types = ['theft', 'suspicious', 'accident', 'harassment', 'other'];
        const severities = ['low', 'medium', 'high'];

        for (let i = 0; i < 50; i++) {
            const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
            const centerLng = randomNeighborhood.center.coordinates[0];
            const centerLat = randomNeighborhood.center.coordinates[1];

            // Random point within neighborhood bounds (simplified)
            const randomLng = centerLng + (Math.random() - 0.5) * 0.02;
            const randomLat = centerLat + (Math.random() - 0.5) * 0.02;

            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);

            incidents.push({
                type: types[Math.floor(Math.random() * types.length)],
                description: 'Örnek olay raporu - Test verisi',
                location: {
                    type: 'Point',
                    coordinates: [randomLng, randomLat]
                },
                severity: severities[Math.floor(Math.random() * severities.length)],
                anonymous: true,
                status: Math.random() > 0.2 ? 'verified' : 'pending',
                upvotes: Math.floor(Math.random() * 10),
                downvotes: Math.floor(Math.random() * 3),
                createdAt
            });
        }

        await Incident.insertMany(incidents);
        console.log(`✅ ${incidents.length} olay eklendi\n`);

        // Calculate safety scores
        console.log('🔢 Güvenlik skorları hesaplanıyor...');
        for (const neighborhood of neighborhoods) {
            const neighborhoodIncidents = await Incident.find({
                location: {
                    $geoWithin: {
                        $geometry: neighborhood.bounds
                    }
                },
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            neighborhood.statistics.last30Days = neighborhoodIncidents.length;
            neighborhood.statistics.byType = {
                theft: neighborhoodIncidents.filter(i => i.type === 'theft').length,
                suspicious: neighborhoodIncidents.filter(i => i.type === 'suspicious').length,
                accident: neighborhoodIncidents.filter(i => i.type === 'accident').length,
                harassment: neighborhoodIncidents.filter(i => i.type === 'harassment').length,
                other: neighborhoodIncidents.filter(i => i.type === 'other').length
            };

            neighborhood.calculateSafetyScore();
            await neighborhood.save();
        }
        console.log('✅ Güvenlik skorları hesaplandı\n');

        console.log('╔═══════════════════════════════════════════╗');
        console.log('║   ✅ Veritabanı başarıyla ilklendirildi! ║');
        console.log('╚═══════════════════════════════════════════╝\n');

        console.log('📊 Özet:');
        console.log(`   Mahalleler: ${neighborhoods.length}`);
        console.log(`   Olaylar: ${incidents.length}`);
        console.log(`   Ortalama Güvenlik Skoru: ${(neighborhoods.reduce((sum, n) => sum + n.safetyScore.current, 0) / neighborhoods.length).toFixed(2)}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

initDatabase();

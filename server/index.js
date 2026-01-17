const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const neighborhoodRoutes = require('./routes/neighborhoods');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://maps.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
                "*.googleapis.com",
                "*.gstatic.com"
            ],
            connectSrc: [
                "'self'",
                "https://maps.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            frameSrc: ["'self'"]
        }
    }
})); // Security headers with CSP for Google Maps
app.use(compression()); // Compress responses
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guvenlik-haritasi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/neighborhoods', neighborhoodRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 Yeni kullanıcı bağlandı:', socket.id);

    // User joins a location room
    socket.on('join-location', (location) => {
        const room = `loc_${Math.floor(location.lat * 100)}_${Math.floor(location.lng * 100)}`;
        socket.join(room);
        console.log(`📍 Kullanıcı ${socket.id} konuma katıldı: ${room}`);
    });

    // User shares location
    socket.on('share-location', (data) => {
        const room = `loc_${Math.floor(data.location.lat * 100)}_${Math.floor(data.location.lng * 100)}`;
        socket.to(room).emit('user-location-update', {
            userId: socket.id,
            location: data.location,
            timestamp: new Date()
        });
    });

    // New incident reported
    socket.on('new-incident', (incident) => {
        // Broadcast to nearby users
        const room = `loc_${Math.floor(incident.location.lat * 100)}_${Math.floor(incident.location.lng * 100)}`;
        io.to(room).emit('incident-alert', {
            type: incident.type,
            severity: incident.severity,
            timestamp: new Date(),
            distance: 'nearby' // Calculate actual distance in production
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Kullanıcı ayrıldı:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Hata:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Sunucu hatası',
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint bulunamadı',
            status: 404
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🛡️  Güvenlik Haritası API Server       ║
║                                           ║
║   🚀 Server çalışıyor: http://localhost:${PORT}
║   📊 Environment: ${process.env.NODE_ENV || 'development'}        ║
║   🗄️  Database: MongoDB                   ║
║   🔌 WebSocket: Aktif                     ║
╚═══════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM sinyali alındı. Sunucu kapatılıyor...');
    server.close(() => {
        console.log('✅ HTTP server kapatıldı');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB bağlantısı kapatıldı');
            process.exit(0);
        });
    });
});

module.exports = { app, io };

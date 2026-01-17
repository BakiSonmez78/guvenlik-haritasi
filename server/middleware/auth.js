const jwt = require('jsonwebtoken');

// Require authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Erişim token\'ı gerekli' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token' });
        }

        req.user = user;
        next();
    });
};

// Optional authentication (allows both authenticated and anonymous users)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }

    next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    next();
};

// Check if user is moderator or admin
const requireModerator = (req, res, next) => {
    if (!req.user || !['moderator', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Moderatör yetkisi gerekli' });
    }
    next();
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireModerator
};

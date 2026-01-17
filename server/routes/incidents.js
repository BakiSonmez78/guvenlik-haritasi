const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateIncident } = require('../middleware/validation');

// Get incidents near a location (public)
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 5000, days = 30 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Konum bilgisi gerekli (lat, lng)' });
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const incidents = await Incident.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            },
            createdAt: { $gte: cutoffDate },
            status: { $in: ['pending', 'verified'] }
        }).limit(100);

        // Return anonymized data
        const publicIncidents = incidents.map(incident => incident.toPublicJSON());

        res.json({
            count: publicIncidents.length,
            incidents: publicIncidents
        });
    } catch (error) {
        console.error('Error fetching nearby incidents:', error);
        res.status(500).json({ error: 'Olaylar yüklenirken hata oluştu' });
    }
});

// Get heatmap data (public)
router.get('/heatmap', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const heatmapData = await Incident.getHeatmapData(null, parseInt(days));

        res.json({
            count: heatmapData.length,
            data: heatmapData.map(item => ({
                lat: Math.round(item.lat * 1000) / 1000, // Privacy: round to 3 decimals
                lng: Math.round(item.lng * 1000) / 1000,
                weight: item.severity === 'high' ? 3 : item.severity === 'medium' ? 2 : 1
            }))
        });
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ error: 'Isı haritası verileri yüklenirken hata oluştu' });
    }
});

// Report new incident (requires auth or anonymous)
router.post('/', optionalAuth, validateIncident, async (req, res) => {
    try {
        const { type, description, location, severity, anonymous } = req.body;

        const incident = new Incident({
            type,
            description,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat]
            },
            severity: severity || 'medium',
            anonymous: anonymous !== false, // Default to anonymous
            reportedBy: req.user && !anonymous ? req.user.id : null,
            status: 'pending',
            metadata: {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip, // Should be hashed in production
                deviceType: req.headers['device-type'] || 'unknown'
            }
        });

        await incident.save();

        // Update user stats if authenticated
        if (req.user && !anonymous) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { 'stats.reportsSubmitted': 1 }
            });
        }

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            const room = `loc_${Math.floor(location.lat * 100)}_${Math.floor(location.lng * 100)}`;
            io.to(room).emit('new-incident', incident.toPublicJSON());
        }

        res.status(201).json({
            message: 'Rapor başarıyla gönderildi',
            incident: incident.toPublicJSON()
        });
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).json({ error: 'Rapor gönderilirken hata oluştu' });
    }
});

// Vote on incident (requires auth)
router.post('/:id/vote', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { vote } = req.body; // 'up' or 'down'

        if (!['up', 'down'].includes(vote)) {
            return res.status(400).json({ error: 'Geçersiz oy türü' });
        }

        const incident = await Incident.findById(id);
        if (!incident) {
            return res.status(404).json({ error: 'Olay bulunamadı' });
        }

        // Check if user already voted
        const existingVote = incident.votedBy.find(v => v.user.toString() === req.user.id);

        if (existingVote) {
            // Update existing vote
            if (existingVote.vote === vote) {
                return res.status(400).json({ error: 'Zaten oy kullandınız' });
            }

            // Change vote
            if (existingVote.vote === 'up') {
                incident.upvotes--;
                incident.downvotes++;
            } else {
                incident.downvotes--;
                incident.upvotes++;
            }
            existingVote.vote = vote;
        } else {
            // New vote
            incident.votedBy.push({ user: req.user.id, vote });
            if (vote === 'up') {
                incident.upvotes++;
            } else {
                incident.downvotes++;
            }
        }

        await incident.save();

        res.json({
            message: 'Oy kaydedildi',
            upvotes: incident.upvotes,
            downvotes: incident.downvotes
        });
    } catch (error) {
        console.error('Error voting on incident:', error);
        res.status(500).json({ error: 'Oy kullanılırken hata oluştu' });
    }
});

// Get incident by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ error: 'Olay bulunamadı' });
        }

        res.json(incident.toPublicJSON());
    } catch (error) {
        console.error('Error fetching incident:', error);
        res.status(500).json({ error: 'Olay yüklenirken hata oluştu' });
    }
});

// Verify incident (moderator/admin only)
router.patch('/:id/verify', authenticateToken, async (req, res) => {
    try {
        if (!['moderator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Yetkiniz yok' });
        }

        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            {
                status: 'verified',
                verifiedBy: req.user.id,
                verifiedAt: new Date()
            },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({ error: 'Olay bulunamadı' });
        }

        res.json({
            message: 'Olay doğrulandı',
            incident: incident.toPublicJSON()
        });
    } catch (error) {
        console.error('Error verifying incident:', error);
        res.status(500).json({ error: 'Olay doğrulanırken hata oluştu' });
    }
});

module.exports = router;

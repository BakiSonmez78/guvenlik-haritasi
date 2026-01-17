const express = require('express');
const router = express.Router();
const Neighborhood = require('../models/Neighborhood');
const Incident = require('../models/Incident');

// Get all neighborhoods
router.get('/', async (req, res) => {
    try {
        const { city, limit = 50 } = req.query;

        const query = city ? { city } : {};
        const neighborhoods = await Neighborhood.find(query)
            .sort({ 'safetyScore.current': -1 })
            .limit(parseInt(limit))
            .select('name city district safetyScore statistics');

        res.json({
            count: neighborhoods.length,
            neighborhoods
        });
    } catch (error) {
        console.error('Error fetching neighborhoods:', error);
        res.status(500).json({ error: 'Mahalleler yüklenirken hata oluştu' });
    }
});

// Get neighborhood by location
router.get('/by-location', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Konum bilgisi gerekli (lat, lng)' });
        }

        const neighborhood = await Neighborhood.findByLocation(
            parseFloat(lng),
            parseFloat(lat)
        );

        if (!neighborhood) {
            return res.status(404).json({ error: 'Bu konumda mahalle bulunamadı' });
        }

        res.json(neighborhood);
    } catch (error) {
        console.error('Error finding neighborhood:', error);
        res.status(500).json({ error: 'Mahalle bulunurken hata oluştu' });
    }
});

// Get top safe neighborhoods
router.get('/top-safe', async (req, res) => {
    try {
        const { city, limit = 10 } = req.query;

        const neighborhoods = await Neighborhood.getTopSafe(city, parseInt(limit));

        res.json({
            count: neighborhoods.length,
            neighborhoods
        });
    } catch (error) {
        console.error('Error fetching top safe neighborhoods:', error);
        res.status(500).json({ error: 'En güvenli mahalleler yüklenirken hata oluştu' });
    }
});

// Get neighborhood details
router.get('/:id', async (req, res) => {
    try {
        const neighborhood = await Neighborhood.findById(req.params.id);

        if (!neighborhood) {
            return res.status(404).json({ error: 'Mahalle bulunamadı' });
        }

        res.json(neighborhood);
    } catch (error) {
        console.error('Error fetching neighborhood:', error);
        res.status(500).json({ error: 'Mahalle yüklenirken hata oluştu' });
    }
});

// Update neighborhood safety scores (admin only - called by cron job)
router.post('/update-scores', async (req, res) => {
    try {
        // This should be protected by admin auth in production
        const neighborhoods = await Neighborhood.find();

        for (const neighborhood of neighborhoods) {
            // Get incidents in this neighborhood from last 30 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);

            const incidents = await Incident.find({
                location: {
                    $geoWithin: {
                        $geometry: neighborhood.bounds
                    }
                },
                createdAt: { $gte: cutoffDate },
                status: { $in: ['pending', 'verified'] }
            });

            // Update statistics
            neighborhood.statistics.last30Days = incidents.length;

            // Count by type
            neighborhood.statistics.byType = {
                theft: incidents.filter(i => i.type === 'theft').length,
                suspicious: incidents.filter(i => i.type === 'suspicious').length,
                accident: incidents.filter(i => i.type === 'accident').length,
                harassment: incidents.filter(i => i.type === 'harassment').length,
                other: incidents.filter(i => i.type === 'other').length
            };

            // Count by time of day
            neighborhood.statistics.byTime = {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            };

            incidents.forEach(incident => {
                const hour = new Date(incident.createdAt).getHours();
                if (hour >= 6 && hour < 12) neighborhood.statistics.byTime.morning++;
                else if (hour >= 12 && hour < 18) neighborhood.statistics.byTime.afternoon++;
                else if (hour >= 18 && hour < 24) neighborhood.statistics.byTime.evening++;
                else neighborhood.statistics.byTime.night++;
            });

            // Calculate safety score
            neighborhood.calculateSafetyScore();

            await neighborhood.save();
        }

        res.json({
            message: 'Mahalle güvenlik skorları güncellendi',
            updated: neighborhoods.length
        });
    } catch (error) {
        console.error('Error updating neighborhood scores:', error);
        res.status(500).json({ error: 'Skorlar güncellenirken hata oluştu' });
    }
});

module.exports = router;

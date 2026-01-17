const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Neighborhood = require('../models/Neighborhood');

// Get overall statistics
router.get('/overview', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        // Total incidents
        const totalIncidents = await Incident.countDocuments({
            createdAt: { $gte: cutoffDate },
            status: { $in: ['pending', 'verified'] }
        });

        // Incidents by type
        const byType = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: cutoffDate },
                    status: { $in: ['pending', 'verified'] }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Incidents by hour
        const byHour = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: cutoffDate },
                    status: { $in: ['pending', 'verified'] }
                }
            },
            {
                $project: {
                    hour: { $hour: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: '$hour',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Format hour data (fill missing hours with 0)
        const hourlyDistribution = Array(24).fill(0);
        byHour.forEach(item => {
            hourlyDistribution[item._id] = item.count;
        });

        // Average safety score
        const avgSafetyScore = await Neighborhood.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$safetyScore.current' }
                }
            }
        ]);

        res.json({
            period: `${days} gün`,
            totalIncidents,
            incidentsByType: byType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            hourlyDistribution,
            averageSafetyScore: avgSafetyScore[0]?.avgScore || 0
        });
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        res.status(500).json({ error: 'İstatistikler yüklenirken hata oluştu' });
    }
});

// Get crime type distribution
router.get('/crime-types', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const distribution = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: cutoffDate },
                    status: { $in: ['pending', 'verified'] }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            period: `${days} gün`,
            distribution
        });
    } catch (error) {
        console.error('Error fetching crime type stats:', error);
        res.status(500).json({ error: 'Suç türü istatistikleri yüklenirken hata oluştu' });
    }
});

// Get time-based analysis
router.get('/time-analysis', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const timeAnalysis = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: cutoffDate },
                    status: { $in: ['pending', 'verified'] }
                }
            },
            {
                $project: {
                    hour: { $hour: '$createdAt' },
                    dayOfWeek: { $dayOfWeek: '$createdAt' },
                    type: 1
                }
            },
            {
                $group: {
                    _id: {
                        hour: '$hour',
                        dayOfWeek: '$dayOfWeek'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            period: `${days} gün`,
            timeAnalysis
        });
    } catch (error) {
        console.error('Error fetching time analysis:', error);
        res.status(500).json({ error: 'Zaman analizi yüklenirken hata oluştu' });
    }
});

// Get neighborhood comparison
router.get('/neighborhood-comparison', async (req, res) => {
    try {
        const { city, limit = 10 } = req.query;

        const query = city ? { city } : {};
        const neighborhoods = await Neighborhood.find(query)
            .sort({ 'safetyScore.current': -1 })
            .limit(parseInt(limit))
            .select('name city district safetyScore statistics');

        res.json({
            neighborhoods: neighborhoods.map(n => ({
                name: n.name,
                city: n.city,
                district: n.district,
                safetyScore: n.safetyScore.current,
                trend: n.safetyScore.trend,
                change: n.safetyScore.change,
                incidents30Days: n.statistics.last30Days
            }))
        });
    } catch (error) {
        console.error('Error fetching neighborhood comparison:', error);
        res.status(500).json({ error: 'Mahalle karşılaştırması yüklenirken hata oluştu' });
    }
});

// Get recent incidents (anonymized)
router.get('/recent-incidents', async (req, res) => {
    try {
        const { limit = 10, days = 7 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const incidents = await Incident.find({
            createdAt: { $gte: cutoffDate },
            status: { $in: ['pending', 'verified'] }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            count: incidents.length,
            incidents: incidents.map(i => i.toPublicJSON())
        });
    } catch (error) {
        console.error('Error fetching recent incidents:', error);
        res.status(500).json({ error: 'Son olaylar yüklenirken hata oluştu' });
    }
});

module.exports = router;

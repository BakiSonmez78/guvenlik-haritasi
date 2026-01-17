const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json(user.toAuthJSON());
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Profil yüklenirken hata oluştu' });
    }
});

// Update user preferences
router.patch('/preferences', authenticateToken, async (req, res) => {
    try {
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Tercihler güncellendi',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Tercihler güncellenirken hata oluştu' });
    }
});

// Update user location
router.post('/location', authenticateToken, async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Konum bilgisi gerekli' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                lastLocation: {
                    type: 'Point',
                    coordinates: [lng, lat],
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Konum güncellendi'
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Konum güncellenirken hata oluştu' });
    }
});

// Add device token for push notifications
router.post('/device-token', authenticateToken, async (req, res) => {
    try {
        const { token, platform } = req.body;

        if (!token || !platform) {
            return res.status(400).json({ error: 'Token ve platform gerekli' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove existing token if present
        user.deviceTokens = user.deviceTokens.filter(dt => dt.token !== token);

        // Add new token
        user.deviceTokens.push({ token, platform });

        await user.save();

        res.json({
            message: 'Cihaz token\'ı kaydedildi'
        });
    } catch (error) {
        console.error('Error adding device token:', error);
        res.status(500).json({ error: 'Token kaydedilirken hata oluştu' });
    }
});

module.exports = router;

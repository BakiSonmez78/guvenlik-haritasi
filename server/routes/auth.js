const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            name
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: user.toAuthJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
    }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Email veya şifre hatalı' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email veya şifre hatalı' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Giriş başarılı',
            token,
            user: user.toAuthJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            valid: true,
            user: user.toAuthJSON()
        });
    } catch (error) {
        res.status(401).json({ error: 'Geçersiz token' });
    }
});

// Guest login (anonymous)
router.post('/guest', async (req, res) => {
    try {
        // Generate a temporary guest token
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const token = jwt.sign(
            { id: guestId, role: 'guest', isGuest: true },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Misafir girişi başarılı',
            token,
            user: {
                id: guestId,
                name: 'Misafir Kullanıcı',
                role: 'guest',
                isGuest: true
            }
        });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ error: 'Misafir girişi sırasında hata oluştu' });
    }
});

module.exports = router;

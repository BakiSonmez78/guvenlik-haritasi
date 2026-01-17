const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            shareLocation: { type: Boolean, default: false },
            showProfile: { type: Boolean, default: false }
        },
        alerts: {
            radius: { type: Number, default: 5000 }, // meters
            types: [{ type: String }]
        }
    },
    stats: {
        reportsSubmitted: { type: Number, default: 0 },
        reportsVerified: { type: Number, default: 0 },
        helpfulVotes: { type: Number, default: 0 }
    },
    lastLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number] // [longitude, latitude]
        },
        updatedAt: Date
    },
    deviceTokens: [{
        token: String,
        platform: { type: String, enum: ['web', 'ios', 'android'] },
        addedAt: { type: Date, default: Date.now }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.preferences.privacy.showProfile ? this.name : 'Anonim Kullanıcı',
        role: this.role,
        stats: this.stats,
        joinedAt: this.createdAt
    };
};

// Method to get safe user data (for auth responses)
userSchema.methods.toAuthJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        isVerified: this.isVerified,
        preferences: this.preferences,
        stats: this.stats
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;

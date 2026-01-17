const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        index: true
    },
    district: {
        type: String,
        required: true
    },
    bounds: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]], // GeoJSON Polygon
            required: true
        }
    },
    center: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    safetyScore: {
        current: {
            type: Number,
            min: 0,
            max: 10,
            default: 5
        },
        history: [{
            score: Number,
            date: Date,
            incidentCount: Number
        }],
        trend: {
            type: String,
            enum: ['positive', 'neutral', 'negative'],
            default: 'neutral'
        },
        change: {
            type: Number,
            default: 0
        }
    },
    statistics: {
        totalIncidents: { type: Number, default: 0 },
        last30Days: { type: Number, default: 0 },
        last7Days: { type: Number, default: 0 },
        byType: {
            theft: { type: Number, default: 0 },
            suspicious: { type: Number, default: 0 },
            accident: { type: Number, default: 0 },
            harassment: { type: Number, default: 0 },
            other: { type: Number, default: 0 }
        },
        byTime: {
            morning: { type: Number, default: 0 },    // 6-12
            afternoon: { type: Number, default: 0 },  // 12-18
            evening: { type: Number, default: 0 },    // 18-24
            night: { type: Number, default: 0 }       // 0-6
        }
    },
    population: {
        type: Number,
        default: 0
    },
    area: {
        type: Number, // in square kilometers
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
neighborhoodSchema.index({ 'bounds': '2dsphere' });
neighborhoodSchema.index({ 'center': '2dsphere' });
neighborhoodSchema.index({ city: 1, district: 1 });
neighborhoodSchema.index({ 'safetyScore.current': -1 });

// Method to calculate safety score based on incidents
neighborhoodSchema.methods.calculateSafetyScore = function () {
    const { last30Days, byType } = this.statistics;

    // Base score starts at 10
    let score = 10;

    // Deduct points based on incident count (normalized by area and population)
    const normalizedIncidents = this.area > 0 && this.population > 0
        ? (last30Days / this.area) / (this.population / 1000)
        : last30Days / 10;

    score -= Math.min(normalizedIncidents * 0.5, 5);

    // Additional deductions for serious incidents
    score -= (byType.harassment * 0.3);
    score -= (byType.theft * 0.2);

    // Ensure score is between 0 and 10
    score = Math.max(0, Math.min(10, score));

    // Calculate trend
    const history = this.safetyScore.history;
    if (history.length >= 2) {
        const previousScore = history[history.length - 2].score;
        const change = score - previousScore;

        this.safetyScore.trend = change > 0.2 ? 'positive' : change < -0.2 ? 'negative' : 'neutral';
        this.safetyScore.change = parseFloat(change.toFixed(2));
    }

    // Update current score
    this.safetyScore.current = parseFloat(score.toFixed(1));

    // Add to history
    this.safetyScore.history.push({
        score: this.safetyScore.current,
        date: new Date(),
        incidentCount: last30Days
    });

    // Keep only last 90 days of history
    if (this.safetyScore.history.length > 90) {
        this.safetyScore.history = this.safetyScore.history.slice(-90);
    }

    this.lastUpdated = new Date();
};

// Static method to find neighborhood by coordinates
neighborhoodSchema.statics.findByLocation = function (longitude, latitude) {
    return this.findOne({
        bounds: {
            $geoIntersects: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            }
        }
    });
};

// Static method to get top safe neighborhoods
neighborhoodSchema.statics.getTopSafe = function (city, limit = 10) {
    const query = city ? { city } : {};
    return this.find(query)
        .sort({ 'safetyScore.current': -1 })
        .limit(limit)
        .select('name city district safetyScore statistics');
};

const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);

module.exports = Neighborhood;

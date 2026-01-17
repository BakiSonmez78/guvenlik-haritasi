const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['theft', 'suspicious', 'accident', 'harassment', 'other'],
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            index: '2dsphere'
        }
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    anonymous: {
        type: Boolean,
        default: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for anonymous reports
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'resolved', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    votedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        vote: {
            type: String,
            enum: ['up', 'down']
        }
    }],
    metadata: {
        userAgent: String,
        ipAddress: String, // Hashed for privacy
        deviceType: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ type: 1, createdAt: -1 });
incidentSchema.index({ status: 1 });

// Virtual for getting lat/lng
incidentSchema.virtual('latitude').get(function () {
    return this.location.coordinates[1];
});

incidentSchema.virtual('longitude').get(function () {
    return this.location.coordinates[0];
});

// Method to anonymize incident data
incidentSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        type: this.type,
        description: this.anonymous ? 'Anonim rapor' : this.description,
        location: {
            // Round to 3 decimal places for privacy (approx 111m precision)
            lat: Math.round(this.location.coordinates[1] * 1000) / 1000,
            lng: Math.round(this.location.coordinates[0] * 1000) / 1000
        },
        severity: this.severity,
        status: this.status,
        upvotes: this.upvotes,
        downvotes: this.downvotes,
        createdAt: this.createdAt,
        // Never expose: reportedBy, metadata, exact location
    };
};

// Static method to get incidents near a location
incidentSchema.statics.findNearby = function (longitude, latitude, maxDistance = 5000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        },
        status: { $in: ['pending', 'verified'] }
    }).limit(50);
};

// Static method to get heatmap data
incidentSchema.statics.getHeatmapData = function (bounds, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: cutoffDate },
                status: { $in: ['pending', 'verified'] }
            }
        },
        {
            $project: {
                lat: { $arrayElemAt: ['$location.coordinates', 1] },
                lng: { $arrayElemAt: ['$location.coordinates', 0] },
                severity: 1,
                type: 1
            }
        }
    ]);
};

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;

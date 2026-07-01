const mongoose = require('mongoose')

const routeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  time: {
    type: String,
    enum: ['day', 'night'],
    default: 'day',
  },
  routes: [
    {
      routeName: String,
      routeLabel: String,    // A, B, C
      travelTime: String,
      distance: String,
      crowdDensity: { type: String, enum: ['High', 'Medium', 'Low'] },
      lightingCondition: { type: String, enum: ['Good', 'Moderate', 'Poor'] },
      crimeRiskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
      policeNearby: Boolean,
      isolated: Boolean,
      safetyScore: Number,
      routeType: { type: String, enum: ['Safe Route', 'Medium Route', 'Risky Route'] },
      via: String,
      tip: String,
    },
  ],
}, {
  timestamps: true,
})

module.exports = mongoose.model('Route', routeSchema)

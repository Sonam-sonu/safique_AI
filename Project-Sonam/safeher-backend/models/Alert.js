const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null,
  },
  alertType: {
    type: String,
    enum: ['Crime', 'Lighting', 'Crowd', 'Police', 'General'],
    default: 'General',
  },
  alertMessage: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  area: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Alert', alertSchema)

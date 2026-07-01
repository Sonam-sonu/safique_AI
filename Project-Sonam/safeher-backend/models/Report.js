const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  lat: {
    type: Number,
    default: null,
  },
  lng: {
    type: Number,
    default: null,
  },
  reportType: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['Harassment', 'Dark Area', 'Suspicious', 'Unsafe Zone', 'No Lighting', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
})

// Auto-calculate riskLevel from severity before save
reportSchema.pre('save', function (next) {
  if (this.isModified('severity')) {
    if (this.severity >= 4) this.riskLevel = 'high'
    else if (this.severity === 3) this.riskLevel = 'medium'
    else this.riskLevel = 'low'
  }
  next()
})

module.exports = mongoose.model('Report', reportSchema)

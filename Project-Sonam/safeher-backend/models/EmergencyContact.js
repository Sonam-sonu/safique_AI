const mongoose = require('mongoose')

const emergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true,
  },
  relation: {
    type: String,
    required: [true, 'Relation is required'],
    trim: true,
    default: 'Other',
  },
}, {
  timestamps: true,
})

// Max 5 contacts per user — enforced in route handler
module.exports = mongoose.model('EmergencyContact', emergencyContactSchema)

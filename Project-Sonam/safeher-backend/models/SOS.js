const mongoose = require('mongoose')

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  location: {
    type: String,
    default: 'Unknown location',
  },
  lat: {
    type: Number,
    default: null,
  },
  lng: {
    type: Number,
    default: null,
  },
  alertMessage: {
    type: String,
    default: 'SOS Alert: I need immediate help! Please contact me.',
  },
  emergencyContacts: [
    {
      contactName: String,
      contactPhone: String,
      relation: String,
    },
  ],
  status: {
    type: String,
    enum: ['Sent', 'Pending', 'Resolved'],
    default: 'Sent',
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('SOS', sosSchema)

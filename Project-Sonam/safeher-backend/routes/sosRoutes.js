const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const SOS = require('../models/SOS')
const EmergencyContact = require('../models/EmergencyContact')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

// ─── POST /api/sos/send ──────────────────────────────────────────────────────
router.post(
  '/send',
  protect,
  [
    body('location').optional().trim(),
    body('lat').optional().isFloat().withMessage('Latitude must be a number'),
    body('lng').optional().isFloat().withMessage('Longitude must be a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { location, lat, lng } = req.body

    // Fetch the user's emergency contacts
    const contacts = await EmergencyContact.find({ userId: req.user._id })
    const contactsPayload = contacts.map((c) => ({
      contactName: c.contactName,
      contactPhone: c.contactPhone,
      relation: c.relation,
    }))

    const locationStr = location || (lat && lng ? `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E` : 'Location unavailable')
    const alertMessage = `🆘 EMERGENCY ALERT from ${req.user.name}!\n\nI need immediate help.\nLocation: ${locationStr}\n\nSent via Safique App.`

    const sosEvent = await SOS.create({
      userId: req.user._id,
      location: locationStr,
      lat: lat || null,
      lng: lng || null,
      alertMessage,
      emergencyContacts: contactsPayload,
      status: 'Sent',
    })

    // Increment user SOS counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { sosCount: 1 } })

    res.status(201).json({
      message: 'Emergency alert sent to trusted contacts',
      sosId: sosEvent._id,
      contactsNotified: contactsPayload.length,
      alertMessage,
    })
  })
)

// ─── GET /api/sos/history ────────────────────────────────────────────────────
router.get(
  '/history',
  protect,
  asyncHandler(async (req, res) => {
    const history = await SOS.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ history })
  })
)

// ─── PUT /api/sos/:id/resolve ────────────────────────────────────────────────
router.put(
  '/:id/resolve',
  protect,
  asyncHandler(async (req, res) => {
    const sos = await SOS.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'Resolved' },
      { new: true }
    )
    if (!sos) return res.status(404).json({ message: 'SOS event not found' })
    res.json({ message: 'SOS event resolved', sos })
  })
)

module.exports = router

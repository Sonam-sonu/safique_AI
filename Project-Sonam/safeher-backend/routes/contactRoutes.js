const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const EmergencyContact = require('../models/EmergencyContact')
const { protect } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

const MAX_CONTACTS = 5

// ─── GET /api/contacts ───────────────────────────────────────────────────────
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const contacts = await EmergencyContact.find({ userId: req.user._id }).sort({ createdAt: 1 })
    res.json({ contacts })
  })
)

// ─── POST /api/contacts/add ──────────────────────────────────────────────────
router.post(
  '/add',
  protect,
  [
    body('contactName').trim().notEmpty().withMessage('Contact name is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
    body('relation').trim().notEmpty().withMessage('Relation is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const count = await EmergencyContact.countDocuments({ userId: req.user._id })
    if (count >= MAX_CONTACTS) {
      return res.status(400).json({
        message: `Maximum ${MAX_CONTACTS} emergency contacts allowed`,
      })
    }

    const { contactName, contactPhone, relation } = req.body
    const contact = await EmergencyContact.create({
      userId: req.user._id,
      contactName,
      contactPhone,
      relation,
    })

    res.status(201).json({ message: 'Emergency contact added successfully', contact })
  })
)

// ─── PUT /api/contacts/:id ───────────────────────────────────────────────────
router.put(
  '/:id',
  protect,
  [
    body('contactName').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('contactPhone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { contactName, contactPhone, relation } = req.body
    const updates = {}
    if (contactName !== undefined) updates.contactName = contactName
    if (contactPhone !== undefined) updates.contactPhone = contactPhone
    if (relation !== undefined) updates.relation = relation

    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    )

    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json({ message: 'Contact updated successfully', contact })
  })
)

// ─── DELETE /api/contacts/:id ────────────────────────────────────────────────
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json({ message: 'Contact removed successfully' })
  })
)

module.exports = router

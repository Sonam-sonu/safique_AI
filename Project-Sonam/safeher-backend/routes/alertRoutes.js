const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const Alert = require('../models/Alert')
const { protect, adminOnly } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

// ─── GET /api/alerts ─────────────────────────────────────────────────────────
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 }).limit(20)
    res.json({ alerts })
  })
)

// ─── GET /api/alerts/route/:routeId ─────────────────────────────────────────
router.get(
  '/route/:routeId',
  protect,
  asyncHandler(async (req, res) => {
    const alerts = await Alert.find({ routeId: req.params.routeId, isActive: true })
    res.json({ alerts })
  })
)

// ─── POST /api/alerts  (admin only) ─────────────────────────────────────────
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('alertMessage').trim().notEmpty().withMessage('Alert message is required'),
    body('riskLevel')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Risk level must be low, medium, or high'),
    body('alertType')
      .optional()
      .isIn(['Crime', 'Lighting', 'Crowd', 'Police', 'General'])
      .withMessage('Invalid alert type'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { alertMessage, riskLevel, alertType, area, routeId } = req.body
    const alert = await Alert.create({
      alertMessage,
      riskLevel,
      alertType: alertType || 'General',
      area: area || '',
      routeId: routeId || null,
    })
    res.status(201).json({ message: 'Alert created', alert })
  })
)

// ─── DELETE /api/alerts/:id  (admin only) ────────────────────────────────────
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const alert = await Alert.findByIdAndDelete(req.params.id)
    if (!alert) return res.status(404).json({ message: 'Alert not found' })
    res.json({ message: 'Alert deleted' })
  })
)

module.exports = router

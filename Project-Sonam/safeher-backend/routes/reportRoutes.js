const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const Report = require('../models/Report')
const User = require('../models/User')
const { protect, adminOnly } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

// ─── POST /api/reports/add ───────────────────────────────────────────────────
router.post(
  '/add',
  protect,
  [
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('reportType')
      .isIn(['Harassment', 'Dark Area', 'Suspicious', 'Unsafe Zone', 'No Lighting', 'Other'])
      .withMessage('Invalid report type'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('severity')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Severity must be between 1 and 5'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { location, reportType, description, severity, lat, lng } = req.body

    const report = await Report.create({
      userId: req.user._id,
      location,
      lat: lat || null,
      lng: lng || null,
      reportType,
      description,
      severity: severity || 3,
    })

    // Increment user reports counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { reportsCount: 1 } })

    res.status(201).json({ message: 'Unsafe area reported successfully', report })
  })
)

// ─── GET /api/reports/my ─────────────────────────────────────────────────────
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ reports })
  })
)

// ─── GET /api/reports/all  (admin only) ──────────────────────────────────────
router.get(
  '/all',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, riskLevel, page = 1, limit = 50 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (riskLevel) filter.riskLevel = riskLevel

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Report.countDocuments(filter)
    res.json({ reports, total, page: Number(page) })
  })
)

// ─── PUT /api/reports/:id/resolve  (admin only) ──────────────────────────────
router.put(
  '/:id/resolve',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user._id },
      { new: true }
    )
    if (!report) return res.status(404).json({ message: 'Report not found' })
    res.json({ message: 'Report resolved', report })
  })
)

// ─── DELETE /api/reports/:id  (admin only) ───────────────────────────────────
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndDelete(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    res.json({ message: 'Report deleted' })
  })
)

module.exports = router

const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Report = require('../models/Report')
const SOS = require('../models/SOS')
const Alert = require('../models/Alert')
const { protect, adminOnly } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')

// All admin routes require auth + admin role
router.use(protect, adminOnly)

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [totalUsers, totalSOS, totalReports, activeAlerts] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      SOS.countDocuments(),
      Report.countDocuments(),
      Alert.countDocuments({ isActive: true }),
    ])

    // Weekly SOS and reports (last 7 days per day)
    const now = new Date()
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const [weekSOS, weekReports] = await Promise.all([
      SOS.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 },
          },
        },
      ]),
      Report.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    // Top reported zones (by location)
    const topZones = await Report.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 }, riskLevel: { $first: '$riskLevel' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    res.json({
      stats: {
        totalUsers,
        totalSOS,
        totalReports,
        activeAlerts,
      },
      weeklyActivity: { sos: weekSOS, reports: weekReports },
      topZones,
    })
  })
)

// ─── GET /api/admin/users ────────────────────────────────────────────────────
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await User.countDocuments({ role: 'user' })
    res.json({ users, total })
  })
)

// ─── PUT /api/admin/users/:id/deactivate ────────────────────────────────────
router.put(
  '/users/:id/deactivate',
  asyncHandler(async (req, res) => {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' })
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deactivated', user })
  })
)

// ─── PUT /api/admin/users/:id/activate ──────────────────────────────────────
router.put(
  '/users/:id/activate',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User activated', user })
  })
)

module.exports = router

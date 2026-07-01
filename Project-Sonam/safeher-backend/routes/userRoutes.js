const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const User = require('../models/User')
const { protect, generateToken } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

// ─── POST /api/users/register ────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, phone, password, bloodGroup } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, phone, password, bloodGroup: bloodGroup || '' })
    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toPublicJSON(),
    })
  })
)

// ─── POST /api/users/login ───────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated — contact support' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicJSON(),
    })
  })
)

// ─── GET /api/users/profile ──────────────────────────────────────────────────
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toPublicJSON() })
  })
)

// ─── PUT /api/users/profile ──────────────────────────────────────────────────
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
      .withMessage('Invalid blood group'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'phone', 'bloodGroup', 'homeLocation']
    const updates = {}
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicJSON(),
    })
  })
)

module.exports = router

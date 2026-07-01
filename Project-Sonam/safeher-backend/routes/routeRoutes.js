const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const RouteModel = require('../models/Route')
const { protect } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const validate = require('../middleware/validate')

// ─── Safety Score Algorithm (mirrors TSD spec) ───────────────────────────────
function calculateSafetyScore({ lighting, crowdDensity, policeNearby, crimeRisk, time, isolated }) {
  let score = 5 // base score
  if (lighting === 'Good')      score += 2
  if (crowdDensity === 'High')  score += 2
  if (policeNearby === true)    score += 1
  if (crimeRisk === 'Low')      score += 2
  if (time === 'day')           score += 1
  if (time === 'night')         score -= 1
  if (crowdDensity === 'Low')   score -= 2
  if (crimeRisk === 'High')     score -= 3
  if (isolated === true)        score -= 2
  return Math.min(Math.max(score, 1), 10)
}

function getRouteType(score) {
  if (score >= 8) return 'Safe Route'
  if (score >= 5) return 'Medium Route'
  return 'Risky Route'
}

// Generate 3 realistic route options based on query
function generateRoutes(startLocation, destination, time) {
  const raw = [
    {
      routeLabel: 'A',
      routeName: `Route A – Main Road`,
      travelTime: '15 min',
      distance: '3.2 km',
      crowdDensity: 'High',
      lightingCondition: 'Good',
      crimeRiskLevel: 'Low',
      policeNearby: true,
      isolated: false,
      via: `${startLocation} → MG Road → Civil Lines → ${destination}`,
      tip: 'Well-lit main road with active police patrol. Highest safety score.',
    },
    {
      routeLabel: 'B',
      routeName: `Route B – City Bypass`,
      travelTime: '11 min',
      distance: '2.6 km',
      crowdDensity: 'Medium',
      lightingCondition: 'Moderate',
      crimeRiskLevel: 'Medium',
      policeNearby: false,
      isolated: false,
      via: `${startLocation} → Bypass Road → Market Street → ${destination}`,
      tip: 'Moderate crowd. Acceptable with caution during daytime.',
    },
    {
      routeLabel: 'C',
      routeName: `Route C – Short Cut`,
      travelTime: '8 min',
      distance: '1.8 km',
      crowdDensity: 'Low',
      lightingCondition: 'Poor',
      crimeRiskLevel: 'High',
      policeNearby: false,
      isolated: true,
      via: `${startLocation} → Park Lane → Isolated Path → ${destination}`,
      tip: 'Isolated path with poor lighting and high crime risk. Avoid.',
    },
  ]

  return raw.map((r) => {
    const score = calculateSafetyScore({
      lighting: r.lightingCondition,
      crowdDensity: r.crowdDensity,
      policeNearby: r.policeNearby,
      crimeRisk: r.crimeRiskLevel,
      time,
      isolated: r.isolated,
    })
    return { ...r, safetyScore: score, routeType: getRouteType(score) }
  })
}

// ─── POST /api/routes/find-safe-route ───────────────────────────────────────
router.post(
  '/find-safe-route',
  protect,
  [
    body('startLocation').trim().notEmpty().withMessage('Start location is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('time').isIn(['day', 'night']).withMessage('Time must be "day" or "night"'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { startLocation, destination, time } = req.body

    const routes = generateRoutes(startLocation, destination, time)
    const sorted = [...routes].sort((a, b) => b.safetyScore - a.safetyScore)

    // Persist the query and result
    const saved = await RouteModel.create({
      userId: req.user._id,
      startLocation,
      destination,
      time,
      routes: sorted,
    })

    // Increment user's routesUsed counter
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      $inc: { routesUsed: 1 },
    })

    res.json({
      message: 'Safe routes found',
      queryId: saved._id,
      routes: sorted,
    })
  })
)

// ─── GET /api/routes/history ─────────────────────────────────────────────────
router.get(
  '/history',
  protect,
  asyncHandler(async (req, res) => {
    const history = await RouteModel.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ history })
  })
)

module.exports = router

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const rateLimit = require('express-rate-limit')

const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')

// Route imports
const userRoutes    = require('./routes/userRoutes')
const routeRoutes   = require('./routes/routeRoutes')
const sosRoutes     = require('./routes/sosRoutes')
const contactRoutes = require('./routes/contactRoutes')
const reportRoutes  = require('./routes/reportRoutes')
const alertRoutes   = require('./routes/alertRoutes')
const adminRoutes   = require('./routes/adminRoutes')

const app = express()

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())

// CORS — allow all localhost ports in dev, specific origin in prod
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (process.env.NODE_ENV === 'development') {
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
    }
    const allowed = process.env.FRONTEND_URL || 'http://localhost:5173'
    if (origin === allowed) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts — please try again in 15 minutes' },
  skip: () => process.env.NODE_ENV === 'development',
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down' },
})

app.use('/api', generalLimiter)
app.use('/api/users/login',    authLimiter)
app.use('/api/users/register', authLimiter)

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/users',    userRoutes)
app.use('/api/routes',   routeRoutes)
app.use('/api/sos',      sosRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/reports',  reportRoutes)
app.use('/api/alerts',   alertRoutes)
app.use('/api/admin',    adminRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Safique Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    db: 'MongoDB',
  })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler)

// ── Start server (only after DB connects) ────────────────────────────────────
const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🚀  Safique backend running on http://localhost:${PORT}`)
    console.log(`📋  Environment: ${process.env.NODE_ENV}`)
    console.log(`🌐  CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`)
  })
}

startServer()

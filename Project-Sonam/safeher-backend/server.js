require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')

// Route imports
const userRoutes = require('./routes/userRoutes')
const routeRoutes = require('./routes/routeRoutes')
const sosRoutes = require('./routes/sosRoutes')
const contactRoutes = require('./routes/contactRoutes')
const reportRoutes = require('./routes/reportRoutes')
const alertRoutes = require('./routes/alertRoutes')
const adminRoutes = require('./routes/adminRoutes')

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (process.env.NODE_ENV === 'development') {
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
    }
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://10.115.106.86:5173' || 'https://safique-ai-max.vercel.app',
    ]
    if (allowedOrigins.includes(origin)) return cb(null, true)
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

// Rate limiting
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
app.use('/api/users/login', authLimiter)
app.use('/api/users/register', authLimiter)

// API routes
app.use('/api/users', userRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/sos', sosRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/admin', adminRoutes)

// Health check
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

// Landing page
app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Safique Backend</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; }
      .card { background: #111827; padding: 32px; border-radius: 16px; max-width: 640px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
      h1 { margin-top: 0; }
      code { background: #1f2937; padding: 2px 6px; border-radius: 6px; }
      a { color: #38bdf8; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Safique Backend</h1>
      <p>This is the backend service for the Safique safety app.</p>
      <p>Use the API endpoints under <code>/api</code> to manage users, routes, SOS alerts, reports, and more.</p>
    
    </div>
  </body>
  </html>`)
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

let dbReady = false

async function ensureDB() {
  if (!dbReady) {
    await connectDB()
    dbReady = true
  }
}

async function startServer() {
  await ensureDB()
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`\n🚀 Safique backend running on http://localhost:${PORT}`)
    console.log(`📋 Environment: ${process.env.NODE_ENV}`)
    console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`)
  })
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}

const handler = async (req, res) => {
  try {
    await ensureDB()
    return app(req, res)
  } catch (err) {
    console.error('Database connection failed during serverless request:', err)
    return res.status(503).json({ message: 'Database unavailable' })
  }
}

module.exports = handler
module.exports.default = handler
module.exports.handler = handler
module.exports.app = app

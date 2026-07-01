require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User   = require('../models/User')
const Alert  = require('../models/Alert')

const connectDB = require('../config/db')

const seedData = async () => {
  await connectDB()

  console.log('🌱  Seeding database...')

  // Clear existing seed data
  await User.deleteMany({ email: { $in: ['admin@safique.app', 'user@safique.app'] } })
  await Alert.deleteMany({})

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@safique.app',
    phone: '+91 9000000001',
    password: 'admin123',
    bloodGroup: 'O+',
    homeLocation: 'Safique HQ, Delhi',
    role: 'admin',
  })

  // Create demo user
  const demoUser = await User.create({
    name: 'Priya Sharma',
    email: 'user@safique.app',
    phone: '+91 9876543210',
    password: 'safique123',
    bloodGroup: 'B+',
    homeLocation: 'Sector 7, Rohini, Delhi',
    role: 'user',
  })

  // Seed safety alerts
  const alerts = await Alert.insertMany([
    {
      alertMessage: 'High crime area reported near City Center. Avoid after 8 PM.',
      riskLevel: 'high',
      alertType: 'Crime',
      area: 'City Center',
      isActive: true,
    },
    {
      alertMessage: 'Street lights not working in Sector 7, Zone B.',
      riskLevel: 'medium',
      alertType: 'Lighting',
      area: 'Sector 7',
      isActive: true,
    },
    {
      alertMessage: 'Police patrol active near MG Road. Safe to travel.',
      riskLevel: 'low',
      alertType: 'Police',
      area: 'MG Road',
      isActive: true,
    },
    {
      alertMessage: 'Isolated path at Riverside reported unsafe at night.',
      riskLevel: 'high',
      alertType: 'Crime',
      area: 'Riverside',
      isActive: true,
    },
  ])

  console.log(`✅  Created admin: ${admin.email}`)
  console.log(`✅  Created demo user: ${demoUser.email}`)
  console.log(`✅  Created ${alerts.length} safety alerts`)
  console.log('\n📋  Demo Credentials:')
  console.log('   Admin  → admin@safique.app  / admin123')
  console.log('   User   → user@safique.app   / safique123')

  await mongoose.disconnect()
  console.log('\n✅  Seeding complete!')
  process.exit(0)
}

seedData().catch((err) => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})

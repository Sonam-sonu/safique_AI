const mongoose = require('mongoose')

const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        tls: true,
      })
      const host = conn.connection.host
      console.log(`✅  MongoDB connected: ${host}`)
      console.log(`📦  Database: safique`)
      return conn
    } catch (err) {
      console.error(`\n❌  MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`)
      if (attempt < retries) {
        console.log(`🔄  Retrying in ${delay / 1000}s...`)
        await new Promise((res) => setTimeout(res, delay))
      } else {
        console.error(`\n💥  All ${retries} connection attempts failed. Exiting.\n`)
        process.exit(1)
      }
    }
  }
}

module.exports = connectDB

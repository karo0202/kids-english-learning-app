import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function checkMongoDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kids-english-app'
  
  console.log('🔍 Checking MongoDB connection...')
  console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`) // Hide credentials
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('✅ MongoDB is connected and ready!')
    await mongoose.disconnect()
    return true
  } catch (error: any) {
    console.log('❌ MongoDB connection failed')
    console.log(`   Error: ${error.message}`)
    console.log('\n💡 Solutions:')
    console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community')
    console.log('   2. Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas')
    console.log('   3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo')
    console.log('\n   After setting up MongoDB, update MONGODB_URI in .env and run setup again.')
    return false
  }
}

checkMongoDB().then(success => {
  process.exit(success ? 0 : 1)
})


const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jansahay:shainy020805@cluster0.qx0xzx9.mongodb.net/jansahay?retryWrites=true&w=majority';

console.log('🔌 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB!');
    console.log('💾 Database: jansahay');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
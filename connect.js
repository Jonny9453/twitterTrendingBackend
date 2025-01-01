const mongoose = require('mongoose');

const connectDB = async() => {
  console.log(process.env.MONGODB_CONNECTION_LINK)
    try {
        await mongoose.connect(`${process.env.MONGODB_CONNECTION_LINK}`, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
      } catch (err) {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
      }
    }
  
  module.exports = connectDB;
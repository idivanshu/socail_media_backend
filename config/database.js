const mongoose = require('mongoose');

// Connect to database
exports.connectDatabase = () => {
    mongoose
    .connect(process.env.MONGO_URI) // This is the URI from the .env file
    .then((con)=>console.log(`MongoDB connected: ${con.connection.host}`))
    .catch((err)=>console.log(`Error: ${err.message}`));
       
    }
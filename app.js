const express = require('express');
const app = express();
const cookie = require('cookie-parser');
if(process.env.NODE_ENV !== 'production'){// This is the NODE_ENV from the .env file
require("dotenv").config({ path: "./config/config.env" });
}

//using middleware
app.use(express.json());  // for parsing application/json
app.use(express.urlencoded({ extended: true }));// this is for parsing the data from the form
app.use(cookie());

// import routes
const postRoutes = require('./routes/post');// This is the route file
const userRoutes = require('./routes/user');// This is the route file
const loginRoutes = require('./routes/user');// This is the route file

// using routes
app.use('/api/sample', postRoutes);// This is the route from the post.js file
app.use('/api/sample', userRoutes);// This is the route from the user.js file
app.use('/api/sample', loginRoutes);// This is the route from the user.js file


module.exports = app;

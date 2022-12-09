const app = require('./app');

const{connectDatabase} = require('./config/database');// This is the database.js file
connectDatabase();// Connect to database

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);// This is the port from the .env file
    });
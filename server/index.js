require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/users')); 

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
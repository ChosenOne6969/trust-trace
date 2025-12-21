const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const app = express();

// --- UPDATED MIDDLEWARE SECTION ---
app.use(express.json()); 

// Explicitly allow your frontend and the custom headers you use
// PRESERVED: Your exact CORS configuration and allowed headers
app.use(cors({
    origin: 'http://localhost:3000', // Allow your Next.js app
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'] // Crucial for your authMiddleware
}));
// ----------------------------------

// Database Connection
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log("✅ Successfully connected to TrustTrace Collective Memory"))
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1); 
  });

// Routes
// PRESERVED: Standard route mapping
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/reports', require('./routes/reports')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
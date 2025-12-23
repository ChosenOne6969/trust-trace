const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

// --- PRODUCTION-READY CORS CONFIGURATION ---
// This handles the preflight (OPTIONS) requests and allows your custom headers
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-project-name.vercel.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    exposedHeaders: ['x-auth-token'], // Allows the frontend to read the token for ranking logic
    credentials: true
}));

// --- HEALTH CHECK ROUTE ---
// Direct this to your Render "Health Check Path" as '/'
app.get('/', (req, res) => {
    res.status(200).send('TrustTrace Collective Memory API is Operational 🛡️');
});

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log("✅ Successfully connected to TrustTrace Collective Memory"))
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    // In production, we don't exit so Render can attempt to restart the container
  });

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/reports', require('./routes/reports')); 

// --- SERVER INITIALIZATION ---
// Listen on '0.0.0.0' to ensure compatibility with cloud hosting providers like Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

// --- PRODUCTION-READY CORS CONFIGURATION ---
// Updated with your specific Vercel URL to allow secure communication
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://trust-trace-beta.vercel.app' // YOUR LIVE FRONTEND URL
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    exposedHeaders: ['x-auth-token'], 
    credentials: true
}));

// --- HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
    res.status(200).send('TrustTrace Collective Memory API is Operational 🛡️');
});

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log("✅ Successfully connected to TrustTrace Collective Memory"))
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
  });

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/reports', require('./routes/reports')); 

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
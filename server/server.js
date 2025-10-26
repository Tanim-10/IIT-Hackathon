// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io');
const socketHandler = require('./socketHandler'); 


dotenv.config();

const app = express();

// --- Configuration for Allowed Frontend Domains ---
const FRONTEND_URLS = [
    "http://localhost:3000",     // Default React port
    "http://localhost:5173",    // Default Vite port
    "https://skillshare-frontend.vercel.app", // Your live deployment domain
    "https://skillshare-backend.render.com" // If deploying backend on Render and accessing directly
];


// Middleware (CORS for standard Express API routes)
app.use(cors({
    // Allow all defined frontend origins for standard REST API requests
    origin: FRONTEND_URLS,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/sessions', require('./routes/sessions')); 
app.use('/api/services', require('./routes/services')); 
app.use('/api/messages', require('./routes/messages')); 


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// --- SOCKET.IO INTEGRATION (CLEANED UP) ---
const server = http.createServer(app); 

// The single, correct Socket.io initialization
const io = new Server(server, {
    cors: {
        // Use the combined list of origins for WebSockets
        origin: FRONTEND_URLS, 
        methods: ["GET", "POST"]
    }
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
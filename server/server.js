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

// Configuration for Allowed Frontend Domains
const FRONTEND_URLS = process.env.NODE_ENV === 'production' 
    ? [
        "https://skillshare-frontend.vercel.app", // Your production frontend URL
        // Add any other production URLs here
      ]
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://skillshare-frontend.vercel.app", // Also allow in development for testing
      ];

// Middleware (CORS for standard Express API routes)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (FRONTEND_URLS.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/projects', require('./routes/projects')); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// SOCKET.IO INTEGRATION
const server = http.createServer(app); 

const io = new Server(server, {
    cors: {
        origin: FRONTEND_URLS, 
        methods: ["GET", "POST"],
        credentials: true
    }
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
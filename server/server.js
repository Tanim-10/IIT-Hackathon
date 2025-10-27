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
const FRONTEND_URLS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://skillshare-frontend.vercel.app",
];

// ✅ CRITICAL: CORS must be the FIRST middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (FRONTEND_URLS.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600
}));

// Handle preflight requests
app.options('*', cors());

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
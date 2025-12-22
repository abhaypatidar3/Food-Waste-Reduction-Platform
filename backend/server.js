const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://savefoodbyabhay.netlify.app'  // ✅ No trailing slash
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Food Waste Reduction API is running',
    environment: process.env.NODE_ENV
  });
});

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res. status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err. stack : undefined
  });
});

const PORT = process.env. PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process. env.NODE_ENV} mode on port ${PORT}`);
});
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const ngoRoutes = require('./routes/ngoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const landingPageRoutes = require('./routes/landingPageRoutes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { cspConfig } = require('./config/csp');

dotenv.config();

connectDB();

const app = express();
//csp interception
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy:  cspConfig,
}));
app.set('trust proxy', 1);
app.use('/api/debug', require('./routes/debug'));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://savefoodbyabhay.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
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

app.use('/api/', generalLimiter); //applied to all req

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/ngo', ngoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landing-page', landingPageRoutes );

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res. status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process. env.NODE_ENV} mode on port ${PORT}`);
});
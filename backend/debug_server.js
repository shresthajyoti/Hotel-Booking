const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

console.log('Starting debug server...');
console.log('Mongo URI:', process.env.MONGODB_URI);

// Connect to database
connectDB().then(() => {
    console.log('DB Connected successfully');
}).catch(err => {
    console.error('DB Connection Failed:', err);
});

const app = express();

// Body parser
app.use(express.json());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use('/api', limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Sanitize data
app.use(mongoSanitize());

// Mount routers
try {
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/dashboard', require('./routes/dashboardRoutes'));
    app.use('/api/properties', require('./routes/propertyRoutes'));
    app.use('/api/bookings', require('./routes/bookingRoutes'));
    app.use('/api/notifications', require('./routes/notificationRoutes'));
    app.use('/api/messages', require('./routes/messageRoutes'));
    console.log('Routes mounted successfully');
} catch (error) {
    console.error('Error mounting routes:', error);
}

const PORT = 5001; // Use a different port

app.listen(PORT, () => {
  console.log(`Debug Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

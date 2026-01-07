const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const xssFilter = require("xss");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5180",
      "http://localhost:5179",
    ],
    credentials: true,
  })
);

// Set security headers
app.use(helmet());

// Prevent XSS attacks
const sanitize = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xssFilter(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitize(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitize(req.body);
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use("/api", limiter);

// Prevent http param pollution
app.use(hpp());

// Sanitize data (Mongo)
const mongoSanitize = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      mongoSanitize(obj[key]);
    }
    if (key.includes("$") || key.includes(".")) {
      obj[key.replace(/\$/g, "_").replace(/\./g, "_")] = obj[key];
      delete obj[key];
    }
  }
};

app.use((req, res, next) => {
  if (req.body) mongoSanitize(req.body);
  next();
});

// Mount routers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

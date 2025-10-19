require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const initAdmin = require("./utils/initAdmin");
const app = express();



// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

const authRoute = require('./routes/auth.routes')
app.use('/hrm/api/v1',authRoute)

// Error Handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server only after DB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await initAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully...");
  process.exit(0);
});

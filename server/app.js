const express = require("express");
const cors = require("cors");
const path = require("path");
const requestRoutes = require("./routes/requestRoutes");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=========================================
Middlewares
=========================================
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
].filter(Boolean);
app.use(
    cors({
        origin: function (origin, callback) {
            // Postman ወይም Browser ባዶ origin ሲልኩ እንዲያልፉ ይፈቅዳል
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, true); // ለ Development ሲባል እንዲያልፍ ማድረግ
            }
        },
        credentials: true, // Cookies / Authorization headers እንዲያልፉ ይፈቅዳል
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization"
        ]
    })
);

app.use(express.json({
    limit: "10mb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
}));

/*
=========================================
Static Files
=========================================
*/

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

/*
=========================================
API Status
=========================================
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Waste Collection Management System API is Running",
        version: "1.0.0",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is Healthy",
    });
});

/*
=========================================
Routes
=========================================
*/

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/residents", require("./routes/residentRoutes"));

app.use("/api/business", require("./routes/businessOwnerRoutes"));

app.use("/api/collectors", require("./routes/collectorRoutes"));

app.use("/api/municipal-admin", require("./routes/municipalAdminRoutes"));

app.use("/api/system-admin", require("./routes/systemAdminRoutes"));

app.use("/api/schedules", require("./routes/scheduleRoutes"));

app.use("/api/requests", require("./routes/requestRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/feedback", require("./routes/feedbackRoutes"));

app.use("/api/reports", require("./routes/reportRoutes"));

app.use("/api/dashboard", require("./routes/dashboardRoutes"));

/*
=========================================
404 Middleware
=========================================
*/

app.use(notFoundMiddleware);

/*
=========================================
Global Error Middleware
=========================================
*/

app.use(errorMiddleware);

module.exports = app;
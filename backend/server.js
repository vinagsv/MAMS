require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth");
const purchasesRoutes = require("./src/routes/purchases");
const transferRoutes = require("./src/routes/transfers");
const assignmentRoutes = require("./src/routes/assignments");
const dashboardRoutes = require("./src/routes/dashboard");
const baseRoutes = require("./src/routes/bases");
const logsRoutes = require("./src/routes/logs");
const equipmentRoutes = require("./src/routes/equipment");
const userRoutes = require("./src/routes/users");

const app = express();

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  process.env.FRONTEND_URL || "https://something.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

connectDB();

//API routes
app.use("/api/auth", authRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bases", baseRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend_dist");
  app.use(express.static(frontendPath));

  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // Local dev root route
  app.get("/", (req, res) => {
    res.send("MAMS Backend (dev) - API running");
  });
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`
  );
});

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

function shutDown() {
  console.log("Received shutdown signal - closing server...");
  server.close(() => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
}

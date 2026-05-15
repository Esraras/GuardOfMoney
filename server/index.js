import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";
import accountRoutes from "./routes/accounts.js";
import budgetRoutes from "./routes/budgets.js";
import { verifyToken } from "./middleware/auth.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3001;
const __filename = fileURLToPath(import.meta.url);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        origin.startsWith("https://localhost") ||
        origin.startsWith("https://127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS hatası: Bu adresten erişim engellendi."));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", verifyToken, accountRoutes);
app.use("/api/budgets", verifyToken, budgetRoutes);
app.use("/api/transactions", verifyToken, transactionRoutes);
app.use("/api/categories", verifyToken, categoryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

if (process.argv[1] === __filename) {
  startServer();
}

export { app, prisma };

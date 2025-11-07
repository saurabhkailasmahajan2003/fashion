// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import morgan from 'morgan';
// import { connectDB } from './config/db.js';

// // Routes
// import productRoutes from './routes/productRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import wishlistRoutes from './routes/wishlistRoutes.js';


// dotenv.config();

// const app = express();
// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// if (process.env.NODE_ENV !== 'test') {
//   app.use(morgan('dev'));
// }

// // DB
// connectDB();

// // Health
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// app.get('/api/health/db', (req, res) => {
//   const state = mongoose.connection.readyState;
//   res.json({ connected: state === 1, state, dbName: mongoose.connection?.name || null });
// });

// // API routes
// app.use('/api/products', productRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/wishlist', wishlistRoutes);

// app.use((req, res) => {
//   res.status(404).json({ message: 'Not Found' });
// });

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   // eslint-disable-next-line no-console
//   console.log(`Server running on port ${PORT}`);
// });




// server.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Setup (allow your Netlify frontend)
app.use(
  cors({
    origin: ["https://elaborate-bavarois-148d23.netlify.app/"], // 🔁 Replace with your actual Netlify domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Logger (optional for debugging)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ✅ Connect to MongoDB
connectDB();

// ✅ Health check routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    connected: state === 1,
    state,
    dbName: mongoose.connection?.name || null,
  });
});

// ✅ API Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ✅ Fallback route for invalid endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// ✅ Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

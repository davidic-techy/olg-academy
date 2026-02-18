import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import moduleRoutes from './src/routes/module.routes.js';
import lessonRoutes from './src/routes/lesson.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

// 1. Config
dotenv.config(); // Load env vars first
const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default

// 2. Connect DB
connectDB();

// 3. Middlewares (MUST COME BEFORE ROUTES)
app.use(express.json()); // Allow JSON data in requests

// 🛠️ FIX: Correct CORS Syntax
app.use(cors({
  origin: [
    "http://localhost:5173",                  // Local Frontend
    "https://olg-academy-1.onrender.com",     // Your Render Frontend (Preview)
    "https://olg-academy.onrender.com"        // Your Main Render Frontend (Production)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 4. Routes
app.get('/', (req, res) => {
  res.send('API is running....');
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 5. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

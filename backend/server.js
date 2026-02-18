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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

// 1. Connect Database
connectDB();

// 2. Middlewares
app.use(express.json());

// ✅ Correct CORS setup
app.use(
  cors({
    origin: origin: [
  "http://localhost:5173",
  "https://olg-academy-1.onrender.com",
  "https://olg-academy.onrender.com" // <--- Add this just to be safe!
],
    credentials: true,
  })
);

// 🔍 DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// 3. Test Route
app.get('/', (req, res) => {
  res.send('API is Live! Send requests to /api/...');
});

// 4. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

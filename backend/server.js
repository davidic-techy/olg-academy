import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from './src/routes/course.routes.js'; // Do you have this file created?
import moduleRoutes from './src/routes/module.routes.js';
import lessonRoutes from './src/routes/lesson.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

// 1. Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Connect DB
connectDB();

// 3. Middlewares (MUST COME BEFORE ROUTES)
app.use(cors({
  origin: 'http://localhost:5173',
  "https://olg-academy-1.onrender.com"
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // <--- This must be here!

// 4. Routes
app.get('/', (req, res) => {
  res.send('API is running....');
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes); // <--- This looks correct
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 5. Start Server
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});

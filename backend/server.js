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

// 2. MIDDLEWARE (The Fix is Here)
// We allow '*' (Everyone) to fix the error immediately.
app.use(cors({
  origin: '*', 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); 

// 3. Test Route
app.get('/', (req, res) => {
  res.send('API is Live and CORS is Open!');
});

// 4. API Routes
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

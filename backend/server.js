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

// 🛠️ CRITICAL CORS FIX 🛠️
app.use(cors({
  origin: '*', // Allow all connections for now to fix the blockage
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔍 DEBUG LOGGER: This will show us in Render logs exactly what URL is being hit
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// 3. Test Route (To check if server is alive)
app.get('/', (req, res) => {
  res.send('API is Live! Send requests to /api/...');
});

// 4. Register Routes
// Note: The /api/courses part is defined HERE. 
// So inside courseRoutes, the path should just be '/'
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

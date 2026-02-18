import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    console.error(err.stack);
});



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

// Use Render's port or default to 10000
const PORT = process.env.PORT || 10000;

// ============================================
// 1. CORS - MUST BE THE FIRST MIDDLEWARE
// ============================================
// This configuration allows ANY website to talk to your backend.
// We removed 'credentials: true' because it conflicts with origin: '*'
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://olg-academy-1.onrender.com'
  ],
  credentials: true
}));

// ============================================
// 2. Body Parsers & Logger
// ============================================
app.use(express.json());

// Debug Logger: See exactly what requests are coming in
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// ============================================
// 3. Routes
// ============================================
// Root Route - To verify server is alive
app.get('/', (req, res) => {
    res.send('API is Live! Send requests to /api/courses');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// 4. 404 Handler (FIXED)
// ============================================
// ⚠️ IMPORTANT: We removed the '*' string here because it causes
// the "PathError: Missing parameter name" crash in newer Express versions.
// Using just the function catches all remaining requests.
app.use((req, res) => {
    console.log(`[ERROR] 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ============================================
// 5. Connect Database & Start Server
// ============================================
const startServer = async () => {
    try {
        await connectDB();
        console.log("✅ Database Connected Successfully");
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        process.exit(1);
    }
};

startServer();

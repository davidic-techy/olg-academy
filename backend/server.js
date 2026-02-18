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

// ============================================
// 1. CORS - MUST BE THE FIRST MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*', // Allow ALL origins (Fixes the blocking issue immediately)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// 2. Body Parsers (After CORS)
// ============================================
app.use(express.json());

// ============================================
// 3. Connect Database (Async Wrapper)
// ============================================
// We wrap this to ensure we don't crash if DB is slow
const startServer = async () => {
    try {
        await connectDB();
        console.log("✅ Database Connected Successfully");
        
        // Only start listening AFTER DB is connected
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        process.exit(1);
    }
};

// ============================================
// 4. Debug Logger (See exactly what URL is hit)
// ============================================
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// ============================================
// 5. Routes
// ============================================
app.get('/', (req, res) => {
    res.send('API is Live! Send requests to /api/courses');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// 6. 404 Handler (Crucial for Debugging)
// ============================================
// If no route matches, this prints why
app.use('*', (req, res) => {
    console.log(`[ERROR] 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Start the server
startServer();

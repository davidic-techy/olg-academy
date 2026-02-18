import express from 'express';
import { 
  getMyCourses, 
  enrollInCourse, 
  enrollWithCode, 
  updateProgress 
} from '../controllers/enrollment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { downloadCertificate } from '../controllers/certificate.controller.js';

const router = express.Router();

// 🔒 All routes here require the user to be logged in
router.use(protect);

// 1. Dashboard: Get my courses
router.get('/my-courses', getMyCourses);

// 2. The "Get Instant Access" Button (Free)
router.post('/:courseId/enroll', enrollInCourse);

// 3. The "Unlock Course" Button (Paid)
router.post('/redeem-code', enrollWithCode);

// 4. Tracking Progress (Video completion)
router.put('/:courseId/progress', updateProgress);

router.get('/:courseId/certificate', protect, downloadCertificate);

export default router;
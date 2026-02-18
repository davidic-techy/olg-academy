import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller.js';

// 👇 Import the security guards
import { protect, authorize } from '../middlewares/auth.middleware.js';
import moduleRouter from './module.routes.js';

const router = express.Router();

router.use('/:courseId/modules', moduleRouter);

// Route: /api/courses
router
  .route('/')
  .get(getCourses) // Public: Anyone can view all courses
  .post(protect, authorize('tutor', 'admin'), createCourse); // Private: Only Tutors/Admins can create

// Route: /api/courses/:id
router
  .route('/:id')
  .get(getCourse) // Public: Anyone can view a single course
  .put(protect, authorize('tutor', 'admin'), updateCourse) // Private: Only Owner/Admin can update
  .delete(protect, authorize('tutor', 'admin'), deleteCourse); // Private: Only Owner/Admin can delete

export default router;
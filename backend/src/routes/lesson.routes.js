import express from 'express';
import {
  addLesson,
  getLessons,
  updateLesson,
  deleteLesson,
} from '../controllers/lesson.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';
import { checkCourseAccess } from '../middlewares/access.middleware.js';

// ⚡ MERGE PARAMS: Critical for nested routes
const router = express.Router({ mergeParams: true });

// Route: /api/courses/:courseId/modules/:moduleId/lessons
router
  .route('/')
  // 🛡️ Only enrolled students, tutors of the course, or admins can see the lessons
  .get(protect, checkCourseAccess, getLessons) 
  // 👨‍🏫 Only Tutors and Admins can create lessons
  .post(protect, authorize('tutor', 'admin'), addLesson);

// Route: /api/lessons/:id (Direct access for Edit/Delete)
router
  .route('/:id')
  .put(protect, authorize('tutor', 'admin'), updateLesson)
  .delete(protect, authorize('tutor', 'admin'), deleteLesson);

export default router;
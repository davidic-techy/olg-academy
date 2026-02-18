import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller.js';

import { protect, authorize } from '../middlewares/auth.middleware.js';
import moduleRouter from './module.routes.js';

const router = express.Router();

// Nested route
router.use('/:courseId/modules', moduleRouter);

// /api/courses
router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('tutor', 'admin'), createCourse);

// /api/courses/:id
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('tutor', 'admin'), updateCourse)
  .delete(protect, authorize('tutor', 'admin'), deleteCourse);

export default router;

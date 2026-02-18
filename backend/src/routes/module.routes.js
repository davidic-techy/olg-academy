import express from 'express';
import {
  addModule,
  getModules,
  updateModule,
  deleteModule,
} from '../controllers/module.controller.js';

// 👇 SECURITY: Import middleware
import { protect, authorize } from '../middlewares/auth.middleware.js';

import lessonRouter from './lesson.routes.js';
// ⚡ MERGE PARAMS: Critical for nested routes
// This allows us to access ':courseId' from the parent router
const router = express.Router({ mergeParams: true });

router.use('/:moduleId/lessons', lessonRouter);

// Route: /api/courses/:courseId/modules
router
  .route('/')
  .get(getModules) // Public: Anyone can see the list of modules
  .post(protect, authorize('tutor', 'admin'), addModule); // Private: Add module to course

// Route: /api/modules/:id (Direct access to module)
// Notice we don't need courseId here because we have the unique Module ID
router
  .route('/:id')
  .put(protect, authorize('tutor', 'admin'), updateModule)
  .delete(protect, authorize('tutor', 'admin'), deleteModule);

export default router;
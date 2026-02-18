import express from 'express';
import { 
  createAssignment, 
  submitAssignment, 
  getMySubmission, 
  getAssignmentSubmissions, 
  gradeSubmission 
} from '../controllers/assignment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require login

// Student Routes
router.post('/:assignmentId/submit', submitAssignment);
router.get('/:assignmentId/my-submission', getMySubmission);

// Tutor Routes
router.post('/modules/:moduleId', authorize('tutor', 'admin'), createAssignment);
router.get('/:assignmentId/submissions', authorize('tutor', 'admin'), getAssignmentSubmissions);
router.put('/submissions/:id/grade', authorize('tutor', 'admin'), gradeSubmission);

export default router;
import express from 'express';
import { approveEnrollment, getPendingEnrollments } from '../controllers/admin.controller.js';
// 🛠️ FIX: Change 'admin' to 'authorize'
import { protect, authorize } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Route: GET /api/admin/pending-enrollments
// 🛠️ FIX: Use authorize('admin')
router.get('/pending-enrollments', protect, authorize('admin'), getPendingEnrollments);

// Route: POST /api/admin/approve-enrollment
// 🛠️ FIX: Use authorize('admin')
router.post('/approve-enrollment', protect, authorize('admin'), approveEnrollment);

export default router;
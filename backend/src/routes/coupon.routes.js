// src/routes/coupon.routes.js (Example)
import express from 'express';
import { generateBulkCoupons, getAllCoupons, deleteCoupon } from '../controllers/coupon.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(admin); // Ensure only TIO can access these

router.post('/generate', generateBulkCoupons);
router.get('/', getAllCoupons);
router.delete('/:id', deleteCoupon);

export default router;
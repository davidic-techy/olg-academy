import Coupon from '../models/Coupon.js';
import crypto from 'crypto';

// @desc    Generate bulk coupons for a specific course
// @route   POST /api/coupons/generate
// @access  Private (Admin Only)
export const generateBulkCoupons = async (req, res) => {
  try {
    const { courseId, count, prefix = 'TIO' } = req.body;
    
    if (!courseId || !count) {
      return res.status(400).json({ message: "Course ID and Count are required" });
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      // Creates a unique 8-character random string
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      const formattedCode = `${prefix}-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}`;
      
      codes.push({
        code: formattedCode,
        course: courseId,
        isUsed: false
      });
    }

    // insertMany is efficient for bulk operations
    const createdCoupons = await Coupon.insertMany(codes);

    res.status(201).json({
      success: true,
      count: createdCoupons.length,
      data: createdCoupons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons (with filtering by course or usage)
// @route   GET /api/coupons
// @access  Private (Admin Only)
export const getAllCoupons = async (req, res) => {
  try {
    const { courseId, isUsed } = req.query;
    let filter = {};
    
    if (courseId) filter.course = courseId;
    if (isUsed) filter.isUsed = isUsed === 'true';

    const coupons = await Coupon.find(filter)
      .populate('course', 'title')
      .populate('userWhoUsed', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a specific coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin Only)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    await coupon.deleteOne();
    res.status(200).json({ success: true, message: "Coupon removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
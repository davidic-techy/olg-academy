import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Coupon from '../models/Coupon.js';

/**
 * @desc    Get all courses I am enrolled in (Dashboard)
 * @route   GET /api/enrollments/my-courses
 */
export const getMyCourses = async (req, res) => {
  try {
    // 🛠️ FIX: Using req.user._id (standard Mongoose ID)
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title thumbnail description price level category modules',
        populate: {
          path: 'modules',
          select: 'title lessons'
        }
      });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Enroll in a course (Handles Free, Manual Transfer, & Paid)
 * @route   POST /api/enrollments/:courseId/enroll
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { paymentMethod, confirmedEmail } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // 1. Check if already active
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existing && existing.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'You are already active in this course!' });
    }

    // 2. Logic: Free vs Manual Transfer vs Paid
    let status = 'pending';
    let type = 'premium';
    let amount = course.price;

    if (course.price === 0) {
      status = 'paid';
      type = 'free_tier';
      amount = 0;
    } 
    // Handle the Manual Transfer flag from your frontend
    else if (paymentMethod === 'manual_transfer') {
      status = 'pending'; 
    }

    const enrollmentData = {
      student: req.user._id,
      course: courseId,
      paymentStatus: status,
      enrollmentType: type,
      amountPaid: amount,
      paymentMethod: paymentMethod || (course.price === 0 ? 'none' : 'pending'),
      // Store the specific email they provided for activation
      confirmedEmail: confirmedEmail || req.user.email, 
      enrolledAt: Date.now()
    };

    // 3. Upsert (Create or Update)
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      enrollmentData,
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      // Strategy tells the frontend where to navigate
      strategy: status === 'paid' ? 'INSTANT_ACCESS' : 'PAYMENT_REQUIRED',
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment Logic Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Redeem Access Code (For Institutional/Bulk Access)
 * @route   POST /api/enrollments/redeem-code
 */
export const enrollWithCode = async (req, res) => {
  try {
    const { code, courseId } = req.body;
    
    // 1. Find Valid Coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(), 
      course: courseId,
      isUsed: false 
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid or expired access code." });
    }

    // 2. Activate Enrollment
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      { 
        paymentStatus: 'paid', 
        paymentId: `CODE-${coupon.code}`,
        paymentMethod: 'access_code',
        enrolledAt: Date.now()
      },
      { new: true, upsert: true }
    );

    // 3. Burn Coupon
    coupon.isUsed = true;
    coupon.userWhoUsed = req.user._id;
    await coupon.save();

    res.status(200).json({ success: true, message: "Course Unlocked!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Lesson Progress
 * @route   PUT /api/enrollments/:courseId/progress
 */
export const updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });

    // 2. Add lesson to completed list (if not already there)
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      await enrollment.save();
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
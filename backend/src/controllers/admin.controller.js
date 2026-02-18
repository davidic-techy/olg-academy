import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Fetch all enrollments waiting for payment verification
// @route   GET /api/admin/pending-enrollments
export const getPendingEnrollments = async (req, res) => {
  try {
    const pending = await Enrollment.find({ paymentStatus: 'pending' })
      .populate('student', 'name email')
      .populate('course', 'title price');

    res.status(200).json({ 
        success: true, 
        count: pending.length,
        data: pending 
    });
  } catch (error) {
    console.error("Fetch Pending Error:", error);
    res.status(500).json({ success: false, message: 'Server Error fetching pending list' });
  }
};

// @desc    Approve a pending enrollment and notify student
// @route   POST /api/admin/approve-enrollment
export const approveEnrollment = async (req, res) => {
  try {
    const { email, courseId } = req.body;

    // 1. Find the User
    const foundUser = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!foundUser) {
      return res.status(404).json({ 
        success: false, 
        message: `No user found with email: ${email}. Please ensure they signed up first.` 
      });
    }

    // 2. Find the Course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // 3. Find and Update Enrollment
    let enrollment = await Enrollment.findOne({ 
      student: foundUser._id, 
      course: courseId 
    });

    if (enrollment) {
      enrollment.paymentStatus = 'paid';
      enrollment.paymentMethod = 'manual_transfer_verified';
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        student: foundUser._id, 
        course: courseId,
        paymentStatus: 'paid',
        paymentMethod: 'manual_transfer_admin_force'
      });
    }

    // 4. Send Email Notification
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const classroomUrl = `${baseUrl}/classroom/${courseId}`;

    try {
      await sendEmail({
        email: foundUser.email,
        name: foundUser.name.split(' ')[0],
        subject: `Access Granted: ${course.title}`,
        courseName: course.title,
        url: classroomUrl
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: `Successfully activated ${course.title} for ${foundUser.email}`
    });

  } catch (error) {
    console.error("Admin Approval Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
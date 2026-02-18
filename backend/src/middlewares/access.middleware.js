import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export const checkCourseAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // 1. Grant access if user is Admin
    if (req.user.role === 'admin') {
      return next();
    }

    // 2. Grant access if user is the Tutor of this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.tutor.toString() === userId) {
      return next();
    }

    // 3. Grant access if an Enrollment exists
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: 'Access denied. You must be enrolled to view this content.' 
      });
    }

    // 4. Success!
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking course access' });
  }
};
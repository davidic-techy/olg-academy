import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js'; // 👈 Needed for security check

// --- ASSIGNMENT ACTIONS (Tutor) ---

// @desc    Create a new assignment
// @route   POST /api/modules/:moduleId/assignments
// @access  Private (Tutor/Admin)
export const createAssignment = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    // 🔒 Security: Only the Course Owner can add assignments
    const course = await Course.findById(module.courseId);
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to modify this course' });
    }

    const assignment = await Assignment.create({
      ...req.body,
      moduleId: req.params.moduleId,
      courseId: module.courseId
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- SUBMISSION ACTIONS (Student) ---

// @desc    Submit an assignment
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // 🔒 CRITICAL SECURITY CHECK: Is the student enrolled & paid?
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: assignment.courseId,
      paymentStatus: { $in: ['paid', 'free'] } // Allow free courses too
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to submit assignments.' });
    }

    // Create Submission
    const submission = await Submission.create({
      assignment: req.params.assignmentId, // Matches schema field name
      student: req.user.id,
      content: req.body.content,
      fileUrl: req.body.fileUrl,
      status: 'submitted'
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    // Handle duplicate submission error (MongoDB code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already submitted this assignment." });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MY submission (For Student to check grade)
// @route   GET /api/assignments/:assignmentId/my-submission
// @access  Private (Student)
export const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    });

    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GRADING ACTIONS (Tutor) ---

// @desc    Get all submissions for a specific assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (Tutor/Admin)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    // Check ownership first (Optional but recommended)
    const assignment = await Assignment.findById(req.params.assignmentId).populate('courseId');
    if (assignment.courseId.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email');

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Tutor/Admin)
export const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        grade,
        feedback,
        status: 'graded',
        gradedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('student', 'name email'); // Return student info so frontend can show "Graded Itunu's work"

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';

// @desc    Add a lesson to a module
// @route   POST /api/modules/:moduleId/lessons
// @access  Private (Tutor/Admin)
export const addLesson = async (req, res) => {
  try {
    // 1. Get Module ID from URL
    req.body.moduleId = req.params.moduleId;

    // 2. Find the Module
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // 3. Find the Grandparent (Course) for Ownership Check
    const course = await Course.findById(module.courseId);
    
    // 🛡️ SECURITY: Only Course Owner can add lessons
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to add a lesson to this course' 
      });
    }

    // 4. DENORMALIZATION: Save courseId in Lesson too (for faster stats later)
    req.body.courseId = module.courseId;

    // 5. Create Lesson
    const lesson = await Lesson.create(req.body);

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all lessons for a module
// @route   GET /api/modules/:moduleId/lessons
// @access  Public
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId })
      .sort('orderIndex'); // Play order: 1, 2, 3...

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Owner/Admin)
export const updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check Ownership via Grandparent Course
    const course = await Course.findById(lesson.courseId);

    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to update this lesson' 
      });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Owner/Admin)
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.courseId);

    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to delete this lesson' 
      });
    }

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
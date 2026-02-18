import Module from '../models/Module.js';
import Course from '../models/Course.js';

// @desc    Add a module to a course
// @route   POST /api/courses/:courseId/modules
// @access  Private (Tutor/Admin)
export const addModule = async (req, res) => {
  try {
    // 1. Get Course ID from URL
    req.body.courseId = req.params.courseId;

    // 2. Check if Course exists
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 3. Check Ownership (Only Tutor or Admin can add modules)
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to add a module to this course' 
      });
    }

    // 4. Create Module
    const module = await Module.create(req.body);

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all modules for a specific course
// @route   GET /api/courses/:courseId/modules
// @access  Public
export const getModules = async (req, res) => {
  try {
    // 1. Check if Course exists first
    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Find Modules & Sort by Order (1, 2, 3...)
    const modules = await Module.find({ courseId: req.params.courseId })
      .sort('orderIndex');

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update module (Title, Order)
// @route   PUT /api/modules/:id
// @access  Private (Owner/Admin)
export const updateModule = async (req, res) => {
  try {
    let module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // To check ownership, we need to look up the PARENT Course
    const course = await Course.findById(module.courseId);

    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to update this module' 
      });
    }

    module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete module (and cascade delete lessons)
// @route   DELETE /api/modules/:id
// @access  Private (Owner/Admin)
export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const course = await Course.findById(module.courseId);

    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        message: 'User not authorized to delete this module' 
      });
    }

    // Trigger the 'deleteOne' hook (Model middleware) to delete lessons
    await module.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
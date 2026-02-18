import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';

// @desc    Get all courses (with filtering)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    // 1. Build Query for Search/Filter
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string for operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // Finding resource
    let query = Course.find(JSON.parse(queryStr));

    // If 'keyword' is sent, use text search (optional if you setup indexes)
    if (req.query.keyword) {
        query = Course.find({ $text: { $search: req.query.keyword } });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default: Newest first
    }

    // Executing query
    // Note: We removed 'tutor' populate for now if you don't have a Tutor model set up yet
    // If you do have users/tutors, uncomment the .populate line below
    const courses = await query; 
    // const courses = await query.populate('tutor', 'name avatar');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course (with full curriculum tree)
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'modules',
        options: { sort: { orderIndex: 1 } },
        // ⚡ THE NESTED POPULATE: This brings the lessons into the modules
        populate: {
          path: 'lessons',
          model: 'Lesson',
          options: { sort: { orderIndex: 1 } }
        }
      })
      .populate('assignments'); // Also bring in the assignments we built

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Tutor/Admin)
export const createCourse = async (req, res) => {
  try {
    // req.body.tutor = req.user.id; // Uncomment if Auth is fully ready
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Owner/Admin)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Auth Check: Make sure user is course owner
    // if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Owner/Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Auth Check
    // if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }

    await course.deleteOne(); 

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 👇 THIS IS THE NEW PART WE NEEDED 👇
// @desc    Seed the DB with OLG Curriculum
// @route   POST /api/courses/seed
// @access  Public (Dev only)
export const seedCourses = async (req, res) => {
  try {
    await Course.deleteMany(); // Clear old data
    
    const courses = [
      {
        title: 'SPSS for Data Analysis',
        track: 'Basic',
        category: 'Statistical Analysis',
        level: 'Beginner',
        duration: '4 Weeks',
        price: 20000,
        description: 'Master the industry standard for social science data processing and statistical analysis.',
        image: 'https://placehold.co/600x400/2D6A9F/FFF?text=SPSS+Mastery',
        instructor: 'Dr. Sarah Mills'
      },
      {
        title: 'Python for Data Analysis',
        track: 'Basic',
        category: 'Data Science',
        level: 'Beginner',
        duration: '8 Weeks',
        price: 30000,
        description: 'Learn the world’s most popular language for manipulating, processing, and cleaning data.',
        image: 'https://placehold.co/600x400/1e4b6e/FFF?text=Python+Analysis',
        instructor: 'Itunuoluwa Olamide'
      },
      {
        title: 'AI for Data Science',
        track: 'Advanced',
        category: 'Artificial Intelligence',
        level: 'Expert',
        duration: '10 Weeks',
        price: 50000,
        description: 'Build predictive models and neural networks to transform raw research into future impact.',
        image: 'https://placehold.co/600x400/000000/9DE38D?text=AI+Data+Science',
        instructor: 'TIO'
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    res.status(201).json({ success: true, data: createdCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      // We will generate this from title (e.g., "intro-to-cells") for SEO-friendly URLs later
    },
    // 🔗 PARENT: The Module this belongs to
    moduleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Module',
      required: true,
      index: true,
    },
    // 🔗 GRANDPARENT: The Course this belongs to (Denormalized for speed)
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
      index: true, 
    },
    // 📹 CONTENT: Supports Video, Text, or Quiz
    type: {
        type: String,
        enum: ['video', 'text', 'quiz'],
        default: 'video'
    },
    videoUrl: {
      type: String, // Can be YouTube ID, Vimeo URL, or AWS Link
      required: false, // Not required if type is 'text' or 'quiz'
    },
    content: {
      type: String, // Markdown text for reading lessons
      required: false,
    },
    duration: {
      type: Number, // In seconds (Standard for video players)
      default: 0,
    },
    
    // ⚡ NEW: QUIZ ENGINE DATA ⚡
    questions: [{
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }], // Array of strings (e.g. ["A", "B", "C", "D"])
      correctAnswer: { type: Number, required: true }, // Index of correct option (0, 1, 2, or 3)
    }],
    passingScore: { 
      type: Number, 
      default: 70, // Percentage required to pass (e.g., 70%)
      min: 0,
      max: 100
    },

    isFree: {
      type: Boolean,
      default: false, // Allow this specific lesson to be previewed?
    },
    orderIndex: {
      type: Number,
      required: true, // Sequence: 1, 2, 3...
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 COMPOUND INDEX:
// "Get all lessons in Module X, sorted by Order"
lessonSchema.index({ moduleId: 1, orderIndex: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true, // ⚡ Optimization: "Show me all courses for Student X"
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
      index: true, // ⚡ Optimization: "Show me all students in Course Y"
    },
    // 💰 TRACKING: Did they pay?
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'free'],
      default: 'free', 
    },
    paymentId: {
      type: String, // Transaction ID from Stripe/Paystack
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    
    // 📈 PROGRESS: Track completion
    completedLessons: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
      },
    ],
    completedModules: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Module',
      },
    ],

    // 🧠 QUIZ ENGINE: Track scores & attempts
    quizScores: [{
      lessonId: { type: mongoose.Schema.ObjectId, ref: 'Lesson' },
      score: { type: Number, required: true }, // Percentage (e.g., 85)
      passed: { type: Boolean, default: false }, // Did they meet passingScore?
      attempts: { type: Number, default: 1 },
      lastAttemptDate: { type: Date, default: Date.now }
    }],

    // 🏆 CERTIFICATE: Official record
    certificate: {
      issued: { type: Boolean, default: false },
      issueDate: { type: Date },
      certificateId: { type: String }, // Unique ID (e.g., OLG-2026-XYZ)
      url: { type: String } // URL to download PDF if stored
    },

    // 📍 RESUME: Where did they leave off?
    lastAccessedLesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson',
    },
    lastAccessedDate: {
      type: Date,
      default: Date.now,
    },

    progress: {
      type: Number, // 0 to 100
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false, // True when progress = 100
    },
    completionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 UNIQUE COMPOUND INDEX:
// A student can only enroll in a specific course ONCE.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
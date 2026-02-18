import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a module title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
      index: true, // ⚡ Optimization: "Get all modules for Course X" is instant
    },
    orderIndex: {
      type: Number,
      required: true, // This defines the sequence (1, 2, 3...)
    },
    isFree: {
      type: Boolean,
      default: false, // Useful for "Preview" modules (marketing strategy)
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 COMPOUND INDEX: 
// Ensures searching for modules within a specific course is highly optimized.
moduleSchema.index({ courseId: 1, orderIndex: 1 });

// 🔗 VIRTUAL RELATIONSHIP:
// "Find all Lessons where 'moduleId' matches my '_id'"
moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'moduleId',
  justOne: false,
  options: { sort: { orderIndex: 1 } }, // Always sort lessons 1, 2, 3...
});

// 🗑️ CASCADE DELETE:
// If a Module is deleted (e.g., "Chapter 1"), delete all its Lessons instantly.
moduleSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  console.log(`Removing lessons for module ${this._id}`);
  await this.model('Lesson').deleteMany({ moduleId: this._id });
  next();
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;
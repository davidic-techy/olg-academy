import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    tutor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true, 
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      default: 0.0, // 0 = Free
    },
    // 🏷️ CATEGORY: Critical for the Frontend Icons (BarChart vs Robot)
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Statistical Analysis', 
        'Programming', 
        'Data Science', 
        'Qualitative Research', 
        'Artificial Intelligence',
        'Machine Learning'
      ],
      default: 'Statistical Analysis'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'], // Added 'expert' for AI courses
      default: 'beginner',
      lowercase: true, // Automatically converts "Beginner" -> "beginner"
    },
    thumbnail: {
      type: String,
      default: 'no-photo.jpg', 
    },
    isPublished: {
      type: Boolean,
      default: false, 
    },
    // 🔴 LIVE SESSION FEATURES (New)
    liveSessionUrl: {
      type: String,
      default: '', 
      trim: true,
    },
    nextSessionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 INDEXING: Fast Search
courseSchema.index({ title: 'text', description: 'text', category: 1 });

// 🔗 VIRTUAL 1: MODULES (The Curriculum)
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'courseId',
  justOne: false,
  options: { sort: { orderIndex: 1 } }, 
});

// 🔗 VIRTUAL 2: ASSIGNMENTS (The Tasks)
courseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'courseId',
  justOne: false,
});

// 🔗 VIRTUAL 3: IMAGE ALIAS (Frontend Compatibility)
// This ensures that if your frontend asks for course.image, it gets course.thumbnail
courseSchema.virtual('image').get(function() {
  return this.thumbnail;
});

// 🗑️ CASCADE DELETE: Clean up modules if course is deleted
courseSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  console.log(`Removing content for course ${this._id}`);
  await this.model('Module').deleteMany({ courseId: this._id });
  await this.model('Assignment').deleteMany({ courseId: this._id }); // Also delete assignments
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
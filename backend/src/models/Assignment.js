import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add instructions for the assignment'],
    },
    moduleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Module',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    attachmentUrl: {
      type: String, // Link to a PDF or template provided by the tutor
    },
    isPremium: {
      type: Boolean,
      default: true, // 🔒 Most assignments should be for Paid students only
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
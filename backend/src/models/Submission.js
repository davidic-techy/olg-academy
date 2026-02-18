import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String, // Text-based answer or description
    },
    fileUrl: {
      type: String, // Link to the uploaded file (PDF/Image)
      required: [true, 'Please upload your assignment file'],
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted',
    },
    grade: {
      type: Number, // The score given by the tutor
      min: 0,
    },
    feedback: {
      type: String, // Tutor's comments
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Prevent multiple submissions for the same assignment by the same student
submissionSchema.index({ assignmentId: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
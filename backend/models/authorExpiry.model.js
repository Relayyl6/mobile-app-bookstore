// models/authorExpiry.model.js
import mongoose from 'mongoose';

const authorExpirySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient cleanup queries
authorExpirySchema.index({ expiryDate: 1 });
authorExpirySchema.index({ userId: 1, author: 1 });

const authorExpiryModel = mongoose.model('AuthorExpiry', authorExpirySchema);

export default authorExpiryModel
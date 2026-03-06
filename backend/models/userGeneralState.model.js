
import { Schema, model } from 'mongoose';

const userGeneralStateSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

const userGeneralStateModel = model('UserGeneralState', userGeneralStateSchema);

export default userGeneralStateModel;
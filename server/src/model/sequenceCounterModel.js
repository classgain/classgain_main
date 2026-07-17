import mongoose from 'mongoose';

const sequenceCounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    seq: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'sequence_counters'
  }
);

const SequenceCounter =
  mongoose.models.SequenceCounter || mongoose.model('SequenceCounter', sequenceCounterSchema);

export default SequenceCounter;

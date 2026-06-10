import mongoose from 'mongoose';

const specialItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 15 },
    available: { type: Boolean, default: true },
    comboEligible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('SpecialItem', specialItemSchema);

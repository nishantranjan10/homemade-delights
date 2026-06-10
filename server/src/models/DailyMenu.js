import mongoose from 'mongoose';

// An override for a specific calendar date. When present it takes precedence
// over the recurring WeeklyMenu for that date + meal type. `date` is stored as
// a YYYY-MM-DD string (Singapore local date) to avoid timezone drift.
const dailyMenuSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    mealType: { type: String, required: true, enum: ['Lunch', 'Dinner'] },
    items: { type: [String], default: [] },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dailyMenuSchema.index({ date: 1, mealType: 1 }, { unique: true });

export default mongoose.model('DailyMenu', dailyMenuSchema);

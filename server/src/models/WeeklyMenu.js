import mongoose from 'mongoose';

// A recurring menu entry for a given day + meal type. Items are stored as an
// array of strings (each component of the thali). One document per
// day/mealType combination (e.g. Monday/Lunch).
const weeklyMenuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
    },
    mealType: { type: String, required: true, enum: ['Lunch', 'Dinner'] },
    items: { type: [String], default: [] },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

weeklyMenuSchema.index({ day: 1, mealType: 1 }, { unique: true });

export default mongoose.model('WeeklyMenu', weeklyMenuSchema);

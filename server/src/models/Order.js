import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    // Which meal type this line belongs to — lets a single order mix
    // Lunch, Dinner, and Special Order items while keeping combo pricing
    // scoped to the specials.
    mealType: {
      type: String,
      required: true,
      enum: ['Lunch', 'Dinner', 'Special Order'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    mealType: {
      type: String,
      required: true,
      enum: ['Lunch', 'Dinner', 'Special Order', 'Mixed'],
    },
    items: { type: [orderItemSchema], required: true },
    fulfilment: { type: String, required: true, enum: ['Pickup', 'Delivery'] },
    preferredDate: { type: String, required: true }, // YYYY-MM-DD
    paymentMethod: {
      type: String,
      required: true,
      enum: ['PayNow', 'PayLah', 'Cash'],
    },
    notes: { type: String, default: '' },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);

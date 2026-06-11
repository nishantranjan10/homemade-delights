import { Router } from 'express';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import { computeTotal } from '../utils/pricing.js';
import { sgToday } from '../utils/date.js';

const router = Router();

// --- Public: place an order ----------------------------------------------
router.post('/', async (req, res) => {
  const {
    customerName,
    phone,
    address,
    items,
    fulfilment,
    preferredDate,
    paymentMethod,
    notes,
  } = req.body || {};

  if (!customerName || !phone || !fulfilment || !preferredDate || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }
  if (fulfilment === 'Delivery' && !address) {
    return res.status(400).json({ message: 'Address is required for delivery' });
  }

  // Derive the order meal type from its line items: a single category keeps
  // its name, anything spanning more than one becomes 'Mixed'.
  const types = [...new Set(items.map((it) => it.mealType).filter(Boolean))];
  const mealType = types.length > 1 ? 'Mixed' : types[0];
  if (!mealType) {
    return res.status(400).json({ message: 'Each item must have a meal type' });
  }

  const total = computeTotal(items);

  const order = await Order.create({
    customerName,
    phone,
    address,
    mealType,
    items,
    fulfilment,
    preferredDate,
    paymentMethod,
    notes,
    total,
  });
  res.status(201).json(order);
});

// --- Admin: list with filters --------------------------------------------
router.get('/', requireAuth, async (req, res) => {
  const { date, mealType, status } = req.query;
  const filter = {};
  if (date) filter.preferredDate = date;
  if (mealType) filter.mealType = mealType;
  if (status) filter.status = status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});

// --- Admin: dashboard summary --------------------------------------------
router.get('/summary', requireAuth, async (_req, res) => {
  const today = sgToday();
  const todays = await Order.find({ preferredDate: today });
  const revenueToday = todays
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const byStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const allRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  res.json({
    date: today,
    todaysOrders: todays.length,
    revenueToday,
    totalRevenue: allRevenue[0]?.total || 0,
    statusCounts: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
  });
});

// --- Admin: update status -------------------------------------------------
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body || {};
  if (!['Pending', 'Confirmed', 'Delivered', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

export default router;

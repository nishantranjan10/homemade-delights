import { Router } from 'express';
import SpecialItem from '../models/SpecialItem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public: list specials (customers only see available ones).
router.get('/', async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { available: true };
  res.json(await SpecialItem.find(filter).sort({ createdAt: 1 }));
});

// Admin CRUD
router.post('/', requireAuth, async (req, res) => {
  const { name, description, price, available, comboEligible } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const item = await SpecialItem.create({
    name,
    description,
    price,
    available,
    comboEligible,
  });
  res.status(201).json(item);
});

router.put('/:id', requireAuth, async (req, res) => {
  const item = await SpecialItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const item = await SpecialItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

export default router;

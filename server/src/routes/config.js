import { Router } from 'express';
import { BUSINESS, PRICING, TIMINGS } from '../config/business.js';

const router = Router();

// Public, read-only business config consumed by the frontend.
router.get('/', (_req, res) => {
  res.json({ business: BUSINESS, pricing: PRICING, timings: TIMINGS });
});

export default router;

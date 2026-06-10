import { Router } from 'express';
import WeeklyMenu from '../models/WeeklyMenu.js';
import DailyMenu from '../models/DailyMenu.js';
import { requireAuth } from '../middleware/auth.js';
import { sgToday, sgDayName } from '../utils/date.js';
import { DAYS } from '../config/business.js';

const router = Router();

// --- Public ---------------------------------------------------------------

// Resolve the effective menu for a date: daily override wins, else weekly.
async function resolveMenuForDate(date) {
  const dayName = sgDayName(date);
  const overrides = await DailyMenu.find({ date });
  const weekly = await WeeklyMenu.find({ day: dayName });

  const byMeal = {};
  for (const meal of ['Lunch', 'Dinner']) {
    const override = overrides.find((o) => o.mealType === meal);
    const recurring = weekly.find((w) => w.mealType === meal);
    const source = override || recurring;
    byMeal[meal] = source
      ? {
          mealType: meal,
          items: source.items,
          available: source.available,
          overridden: Boolean(override),
        }
      : { mealType: meal, items: [], available: false, overridden: false };
  }
  return { date, day: dayName, meals: byMeal };
}

// Today's menu (lunch + dinner).
router.get('/today', async (_req, res) => {
  const today = sgToday();
  res.json(await resolveMenuForDate(today));
});

// Menu for an arbitrary date ?date=YYYY-MM-DD (defaults to today).
router.get('/date', async (req, res) => {
  const date = req.query.date || sgToday();
  res.json(await resolveMenuForDate(date));
});

// Full recurring weekly menu, grouped by day in calendar order.
router.get('/weekly', async (_req, res) => {
  const all = await WeeklyMenu.find();
  const grouped = DAYS.map((day) => ({
    day,
    meals: ['Lunch', 'Dinner'].map((mealType) => {
      const entry = all.find((m) => m.day === day && m.mealType === mealType);
      return {
        mealType,
        items: entry?.items || [],
        available: entry?.available ?? true,
      };
    }),
  }));
  res.json(grouped);
});

// --- Admin ----------------------------------------------------------------

// Upsert a recurring weekly menu entry.
router.put('/weekly', requireAuth, async (req, res) => {
  const { day, mealType, items, available } = req.body || {};
  if (!DAYS.includes(day) || !['Lunch', 'Dinner'].includes(mealType)) {
    return res.status(400).json({ message: 'Invalid day or mealType' });
  }
  const entry = await WeeklyMenu.findOneAndUpdate(
    { day, mealType },
    { items: items || [], ...(available !== undefined && { available }) },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(entry);
});

// Post / override a menu for a specific date.
router.put('/daily', requireAuth, async (req, res) => {
  const { date, mealType, items, available } = req.body || {};
  if (!date || !['Lunch', 'Dinner'].includes(mealType)) {
    return res.status(400).json({ message: 'Invalid date or mealType' });
  }
  const entry = await DailyMenu.findOneAndUpdate(
    { date, mealType },
    { items: items || [], ...(available !== undefined && { available }) },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(entry);
});

// Remove a daily override (fall back to weekly default).
router.delete('/daily', requireAuth, async (req, res) => {
  const { date, mealType } = req.body || {};
  await DailyMenu.findOneAndDelete({ date, mealType });
  res.json({ message: 'Override removed' });
});

export default router;

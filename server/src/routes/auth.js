import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import VerificationCode from '../models/VerificationCode.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail, sendWhatsApp, providersConfigured } from '../services/notifier.js';
import { maskEmail, maskPhone } from '../utils/mask.js';

const router = Router();

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

function issueToken(admin) {
  return jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const admin = await Admin.findOne({ username });
  if (!admin || !(await admin.verifyPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: issueToken(admin), admin: { username: admin.username } });
});

// Returns the signed-in admin's profile (own contact details, for Settings).
router.get('/me', requireAuth, async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json({
    admin: { username: admin.username, email: admin.email, phone: admin.phone },
  });
});

// --- Credential change: step 1, request a verification code ----------------
router.post('/account/request-code', requireAuth, async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  if (!admin.email && !admin.phone) {
    return res.status(400).json({
      message:
        'No email or WhatsApp number is on file for this admin. Set ADMIN_EMAIL / ADMIN_PHONE and re-seed.',
    });
  }

  // One active code at a time per admin.
  await VerificationCode.deleteMany({ admin: admin._id, purpose: 'account-update' });

  const code = String(crypto.randomInt(100000, 1000000)); // 6 digits
  await VerificationCode.create({
    admin: admin._id,
    purpose: 'account-update',
    codeHash: await VerificationCode.hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60 * 1000),
  });

  const text = `Your ${'Rupali\'s Homemade Delights'} admin verification code is ${code}. It expires in ${CODE_TTL_MIN} minutes. If you didn't request this, ignore this message.`;

  const results = await Promise.allSettled([
    admin.email ? sendEmail({ to: admin.email, subject: 'Admin verification code', text }) : null,
    admin.phone ? sendWhatsApp({ to: admin.phone, text }) : null,
  ]);

  const sentTo = [];
  if (admin.email) sentTo.push({ channel: 'email', to: maskEmail(admin.email) });
  if (admin.phone) sentTo.push({ channel: 'whatsapp', to: maskPhone(admin.phone) });

  const configured = providersConfigured();
  const allSimulated =
    (!admin.email || !configured.email) && (!admin.phone || !configured.whatsapp);

  res.json({
    message: 'Verification code sent',
    sentTo,
    expiresInMinutes: CODE_TTL_MIN,
    // Dev convenience only: when no real provider is wired up and we're not in
    // production, return the code so the flow is testable. Never shown in prod.
    ...(process.env.NODE_ENV !== 'production' && allSimulated ? { devCode: code } : {}),
    deliveryErrors: results
      .filter((r) => r.status === 'rejected')
      .map((r) => String(r.reason?.message || r.reason)),
  });
});

// --- Credential change: step 2, verify code and apply changes --------------
router.post('/account/update', requireAuth, async (req, res) => {
  const { code, newUsername, newPassword, email, phone } = req.body || {};
  if (!code) return res.status(400).json({ message: 'Verification code is required' });
  if (!newUsername && !newPassword && email === undefined && phone === undefined) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const record = await VerificationCode.findOne({
    admin: admin._id,
    purpose: 'account-update',
  }).sort({ createdAt: -1 });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Code expired — please request a new one' });
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    return res.status(429).json({ message: 'Too many attempts — request a new code' });
  }
  if (!(await record.verify(code))) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ message: 'Incorrect code' });
  }

  // Apply requested changes.
  if (newUsername && newUsername !== admin.username) {
    const clash = await Admin.findOne({ username: newUsername });
    if (clash) return res.status(409).json({ message: 'That username is already taken' });
    admin.username = newUsername;
  }
  if (newPassword) {
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    await admin.setPassword(newPassword);
  }
  if (email !== undefined) admin.email = email;
  if (phone !== undefined) admin.phone = phone;

  await admin.save();
  await record.deleteOne();

  // Re-issue the token so a username change doesn't log the admin out.
  res.json({
    message: 'Account updated',
    token: issueToken(admin),
    admin: { username: admin.username, email: admin.email, phone: admin.phone },
  });
});

export default router;

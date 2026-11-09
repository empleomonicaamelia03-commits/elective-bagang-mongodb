import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Message from '../models/Message.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const SUBJECTS = ['Appointment Booking', 'Service Inquiry', 'Price Quote', 'General Question'];
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// POST /api/contact
router.post('/', limiter, async (req, res, next) => {
  try {
    const { name, phone, subject, message } = {
      name: str(req.body?.name),
      phone: str(req.body?.phone),
      subject: str(req.body?.subject),
      message: str(req.body?.message),
    };

    if (!name) return res.status(400).json({ error: 'Name is required.' });
    if (!SUBJECTS.includes(subject)) return res.status(400).json({ error: 'Please choose a subject.' });
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    await Message.create({ name, phone, subject, message });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact  (staff) – newest first
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const filter = req.query.handled === undefined ? {} : { handled: req.query.handled === 'true' };
    res.json(await Message.find(filter).sort({ createdAt: -1 }).limit(200));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/contact/:id  (staff) – mark handled
router.patch('/:id', adminAuth, async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { handled: !!req.body?.handled }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found.' });
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

export default router;

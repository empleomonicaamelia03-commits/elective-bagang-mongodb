import { Router } from 'express';
import mongoose from 'mongoose';
import AppointmentInvoice from '../models/AppointmentInvoice.js';
import Appointment from '../models/Appointment.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// All invoice routes are staff only.
router.use(adminAuth);

// GET /api/invoices?paid=false
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.paid === undefined ? {} : { is_paid: req.query.paid === 'true' };
    const invoices = await AppointmentInvoice.find(filter).sort({ createdAt: -1 }).limit(500).populate({
      path: 'app_id',
      select: 'queue_number app_date app_timestart app_status patient_id',
      populate: { path: 'patient_id', select: 'patient_fname patient_lname' },
    });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// Finds an invoice from either an appointment _id or an active 4-digit queue number.
async function findInvoice(ref) {
  let appId = ref;
  if (/^\d{4}$/.test(ref)) {
    const appt = await Appointment.findOne({ queue_number: ref, active: true });
    appId = appt?._id;
  }
  if (!appId || !mongoose.isValidObjectId(appId)) return null;
  return AppointmentInvoice.findOne({ app_id: appId });
}

// POST /api/invoices/:ref/payment   { "amount": 500 }   (:ref = queue number or appointment id)
router.post('/:ref/payment', async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a number greater than 0.' });
    }

    const invoice = await findInvoice(req.params.ref);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    invoice.patient_paid += amount;
    invoice.total_due = Math.max(invoice.service_cost - invoice.patient_paid, 0);
    invoice.is_paid = invoice.total_due === 0;
    invoice.payment_date = new Date();
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

export default router;

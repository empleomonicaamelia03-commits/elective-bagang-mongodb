import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Patient from '../models/Patient.js';
import Service from '../models/Service.js';
import Dentist from '../models/Dentist.js';
import Schedule from '../models/Schedule.js';
import PatientService from '../models/PatientService.js';
import Appointment from '../models/Appointment.js';
import AppointmentInvoice from '../models/AppointmentInvoice.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { TIME_SLOTS } from '../data/catalog.js';
import { todayInClinic, addDays, addMinutes, ageOn, isValidISODate, weekdayOf } from '../utils/dates.js';

const router = Router();

const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
// Queue numbers are only 4 digits, so lookups are throttled to make guessing impractical.
const lookupLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const randomNumber = () => String(Math.floor(1000 + Math.random() * 9000));

// The website sends the booking form fields; this checks everything that doesn't need the database.
function validateNewBooking(body) {
  const errors = [];
  const data = {
    firstName: str(body.pfirstName),
    lastName: str(body.plastName),
    email: str(body.patientemail).toLowerCase(),
    contact: str(body.patientcontact),
    dateOfBirth: str(body.dateOfBirth),
    service: str(body.service),
    dentist: str(body.dentist),
    appointmentDate: str(body.appointmentDate),
    appointmentTime: str(body.appointmentTime),
  };

  if (!data.firstName) errors.push('First name is required.');
  if (!data.lastName) errors.push('Last name is required.');
  if (!EMAIL_RE.test(data.email)) errors.push('A valid email is required.');
  if (data.contact.replace(/\D/g, '').length < 7) errors.push('A valid contact number is required.');

  if (!isValidISODate(data.dateOfBirth) || data.dateOfBirth > todayInClinic()) {
    errors.push('A valid date of birth is required.');
  }
  if (!data.service) errors.push('Please choose a service.');
  if (!data.dentist) errors.push('Please choose a dentist.');
  if (!TIME_SLOTS.includes(data.appointmentTime)) errors.push('Please choose a valid time.');

  if (!isValidISODate(data.appointmentDate)) {
    errors.push('A valid appointment date is required.');
  } else {
    if (data.appointmentDate < addDays(todayInClinic(), 1)) {
      errors.push('Appointments must be booked at least one day ahead.');
    }
    if (weekdayOf(data.appointmentDate) === 0) {
      errors.push('The clinic is closed on Sundays. Please choose Monday to Saturday.');
    }
  }

  return { errors, data };
}

const dentistLabel = (d) => `Dr. ${d.dentist_fname} ${d.dentist_lname} - ${d.dentist_specialty}`;

// What a patient is allowed to see. Personal details (email, phone, birth date) are never returned here.
function publicView(appt, service, dentist, total) {
  return {
    number: appt.queue_number,
    status: appt.app_status,
    serviceName: service.service_name,
    dentistName: dentistLabel(dentist),
    appointmentDate: appt.app_date,
    appointmentTime: appt.app_timestart,
    total,
  };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Creates the appointment, retrying if the random queue number collides with another active one.
async function insertAppointment(fields) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await Appointment.create({ ...fields, queue_number: randomNumber() });
    } catch (err) {
      if (err.code !== 11000) throw err;
      if (err.keyPattern?.queue_number) continue;
      throw new HttpError(409, 'That dentist is already booked at that date and time. Please pick another slot.');
    }
  }
  throw new HttpError(503, 'Could not allocate a queue number. Please try again.');
}

// POST /api/bookings
// Creates (or reuses) the patient, then the appointment, its invoice and the patient_services link.
router.post('/', createLimiter, async (req, res, next) => {
  try {
    const { errors, data } = validateNewBooking(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const [service, dentist] = await Promise.all([
      Service.findOne({ slug: data.service }),
      Dentist.findOne({ slug: data.dentist }),
    ]);
    if (!service) return res.status(400).json({ error: 'Please choose a valid service.' });
    if (!dentist) return res.status(400).json({ error: 'Please choose a valid dentist.' });

    // The dentist's weekly schedule decides which days and hours can be booked.
    const schedule = await Schedule.findOne({
      dentist_id: dentist._id,
      day_of_week: weekdayOf(data.appointmentDate),
    });
    if (!schedule) {
      return res.status(400).json({ error: `${dentistLabel(dentist)} is not available on that day.` });
    }
    const timeEnd = addMinutes(data.appointmentTime, service.service_duration_minutes);
    if (data.appointmentTime < schedule.start_time || timeEnd > schedule.end_time) {
      return res.status(400).json({ error: 'That time is outside the dentist\'s working hours.' });
    }

    const patient = await Patient.findOneAndUpdate(
      { patient_email: data.email, patient_fname: data.firstName, patient_lname: data.lastName },
      {
        $set: {
          patient_phone: data.contact,
          patient_dob: data.dateOfBirth,
          patient_age: ageOn(data.dateOfBirth, todayInClinic()),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const appt = await insertAppointment({
      app_date: data.appointmentDate,
      app_timestart: data.appointmentTime,
      app_timeend: timeEnd,
      patient_id: patient._id,
      dentist_id: dentist._id,
      service_id: service._id,
    });

    try {
      await AppointmentInvoice.create({
        app_id: appt._id,
        service_cost: service.service_cost,
        patient_paid: 0,
        total_due: service.service_cost,
      });
      await PatientService.updateOne(
        { patient_id: patient._id, service_id: service._id },
        { $set: { patient_id: patient._id, service_id: service._id } },
        { upsert: true }
      );
    } catch (err) {
      // Don't leave an appointment without its invoice behind.
      await AppointmentInvoice.deleteOne({ app_id: appt._id });
      await Appointment.deleteOne({ _id: appt._id });
      throw err;
    }

    res.status(201).json(publicView(appt, service, dentist, service.service_cost));
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// GET /api/bookings/:number  – patient looks up status + queue position
router.get('/:number(\\d{4})', lookupLimiter, async (req, res, next) => {
  try {
    const appt = await Appointment.findOne({ queue_number: req.params.number })
      .sort({ createdAt: -1 })
      .populate('dentist_id')
      .populate('service_id');
    if (!appt) return res.status(404).json({ error: 'Booking not found.' });

    const invoice = await AppointmentInvoice.findOne({ app_id: appt._id });
    const total = invoice ? invoice.service_cost : appt.service_id.service_cost;

    let position = null;
    if (appt.app_status === 'waiting') {
      // Queue = waiting appointments on the same date, ordered by start time then booking time.
      position =
        1 +
        (await Appointment.countDocuments({
          app_date: appt.app_date,
          app_status: 'waiting',
          $or: [
            { app_timestart: { $lt: appt.app_timestart } },
            { app_timestart: appt.app_timestart, createdAt: { $lt: appt.createdAt } },
          ],
        }));
    }

    res.json({ ...publicView(appt, appt.service_id, appt.dentist_id, total), position });
  } catch (err) {
    next(err);
  }
});

// ---- Staff routes (require x-api-key) ----

// GET /api/bookings?date=YYYY-MM-DD&status=waiting
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.app_date = String(req.query.date);
    if (req.query.status) filter.app_status = String(req.query.status);

    const appointments = await Appointment.find(filter)
      .sort({ app_date: 1, app_timestart: 1 })
      .limit(500)
      .populate('patient_id', 'patient_fname patient_lname patient_email patient_phone')
      .populate('dentist_id', 'dentist_fname dentist_lname dentist_specialty')
      .populate('service_id', 'service_name service_cost');
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:number/status  { "status": "ready" | "completed" | "cancelled" | "waiting" }
router.patch('/:number(\\d{4})/status', adminAuth, async (req, res, next) => {
  try {
    const status = str(req.body?.status);
    if (!['waiting', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const appt = await Appointment.findOne({ queue_number: req.params.number, active: true });
    if (!appt) return res.status(404).json({ error: 'No active appointment with that number.' });

    appt.app_status = status;
    appt.active = status === 'waiting' || status === 'ready';
    await appt.save();
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

export default router;

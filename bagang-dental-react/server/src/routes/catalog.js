import { Router } from 'express';
import Service from '../models/Service.js';
import Dentist from '../models/Dentist.js';
import Schedule from '../models/Schedule.js';

const router = Router();

// GET /api/services
router.get('/services', async (req, res, next) => {
  try {
    res.json(await Service.find().sort({ service_name: 1 }));
  } catch (err) {
    next(err);
  }
});

// GET /api/dentists
router.get('/dentists', async (req, res, next) => {
  try {
    res.json(await Dentist.find().sort({ dentist_lname: 1 }));
  } catch (err) {
    next(err);
  }
});

// GET /api/dentists/:slug/schedule  – weekly working hours
router.get('/dentists/:slug/schedule', async (req, res, next) => {
  try {
    const dentist = await Dentist.findOne({ slug: req.params.slug });
    if (!dentist) return res.status(404).json({ error: 'Dentist not found.' });
    res.json(await Schedule.find({ dentist_id: dentist._id }).sort({ day_of_week: 1 }));
  } catch (err) {
    next(err);
  }
});

export default router;

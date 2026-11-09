import Service from './models/Service.js';
import Dentist from './models/Dentist.js';
import Schedule from './models/Schedule.js';
import { SERVICES, DENTISTS, WORKING_DAYS, WORK_START, WORK_END } from './data/catalog.js';

// Inserts the starting services, dentists and weekly schedules.
// - Default: only runs when the database has no services/dentists yet (safe on every start).
// - overwrite: true updates existing rows (matched by slug) with the values in catalog.js.
export async function seedCatalog({ overwrite = false } = {}) {
  if (!overwrite) {
    const [services, dentists] = await Promise.all([
      Service.estimatedDocumentCount(),
      Dentist.estimatedDocumentCount(),
    ]);
    if (services > 0 && dentists > 0) return false;
  }

  for (const s of SERVICES) {
    await Service.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
  }

  for (const d of DENTISTS) {
    await Dentist.updateOne({ slug: d.slug }, { $set: d }, { upsert: true });
    const dentist = await Dentist.findOne({ slug: d.slug });
    for (const day of WORKING_DAYS) {
      await Schedule.updateOne(
        { dentist_id: dentist._id, day_of_week: day },
        { $set: { start_time: WORK_START, end_time: WORK_END } },
        { upsert: true }
      );
    }
  }

  console.log('Seeded services, dentists and schedules.');
  return true;
}

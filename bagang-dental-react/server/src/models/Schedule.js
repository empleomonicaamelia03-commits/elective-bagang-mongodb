import mongoose from 'mongoose';

const { Schema } = mongoose;

// ERD entity: SCHEDULE   (schedule_id = the document's _id)
// One document per dentist per working weekday.
const scheduleSchema = new Schema(
  {
    dentist_id: { type: Schema.Types.ObjectId, ref: 'Dentist', required: true },
    day_of_week: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday ... 6 = Saturday
    start_time: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "08:00"
    end_time: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "17:00"
  },
  { timestamps: true, collection: 'schedules' }
);

scheduleSchema.index({ dentist_id: 1, day_of_week: 1 }, { unique: true });

export default mongoose.model('Schedule', scheduleSchema);

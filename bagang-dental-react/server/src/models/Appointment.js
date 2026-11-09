import mongoose from 'mongoose';

const { Schema } = mongoose;

// ERD entity: APPOINTMENT   (app_id = the document's _id)
const appointmentSchema = new Schema(
  {
    app_date: { type: String, required: true }, // YYYY-MM-DD (clinic local date)
    app_timestart: { type: String, required: true }, // HH:MM, 24h
    app_timeend: { type: String, required: true }, // HH:MM, start + service duration

    patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    dentist_id: { type: Schema.Types.ObjectId, ref: 'Dentist', required: true },
    service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },

    app_status: {
      type: String,
      enum: ['waiting', 'ready', 'completed', 'cancelled'],
      default: 'waiting',
    },

    // Extra fields (not in the original ERD) needed by the website:
    queue_number: { type: String, required: true, match: /^\d{4}$/ }, // the 4-digit number patients use in "Check Queue"
    active: { type: Boolean, default: true }, // true while waiting/ready; frees the slot and number when false
  },
  { timestamps: true, collection: 'appointments' }
);

// A dentist can only have one active appointment per date + start time.
appointmentSchema.index(
  { dentist_id: 1, app_date: 1, app_timestart: 1 },
  { unique: true, partialFilterExpression: { active: true }, name: 'unique_active_slot' }
);

// A queue number belongs to one active appointment at a time.
appointmentSchema.index(
  { queue_number: 1 },
  { unique: true, partialFilterExpression: { active: true }, name: 'unique_active_queue_number' }
);

appointmentSchema.index({ app_date: 1, app_status: 1 });

export default mongoose.model('Appointment', appointmentSchema);

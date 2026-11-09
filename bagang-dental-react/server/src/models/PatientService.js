import mongoose from 'mongoose';

const { Schema } = mongoose;

// ERD entity: PATIENT SERVICES (composite key patient_id + service_id)
// Records which services a patient has booked. Filled automatically when a booking is made.
const patientServiceSchema = new Schema(
  {
    patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  },
  { timestamps: true, collection: 'patient_services' }
);

patientServiceSchema.index({ patient_id: 1, service_id: 1 }, { unique: true });

export default mongoose.model('PatientService', patientServiceSchema);

import mongoose from 'mongoose';

// ERD entity: PATIENT   (patient_id = the document's _id)
const patientSchema = new mongoose.Schema(
  {
    patient_fname: { type: String, required: true, trim: true, maxlength: 80 },
    patient_lname: { type: String, required: true, trim: true, maxlength: 80 },
    patient_age: { type: Number, min: 0, max: 130 },
    patient_dob: { type: String, required: true }, // YYYY-MM-DD
    patient_email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    patient_phone: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true, collection: 'patients' }
);

// The same person booking again is matched (and reused) by email + name.
patientSchema.index({ patient_email: 1, patient_fname: 1, patient_lname: 1 }, { unique: true });

export default mongoose.model('Patient', patientSchema);

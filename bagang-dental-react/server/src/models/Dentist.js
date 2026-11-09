import mongoose from 'mongoose';

// ERD entity: DENTIST   (dentist_id = the document's _id)
const dentistSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true }, // short key the website sends, e.g. "monica"
    dentist_fname: { type: String, required: true, trim: true },
    dentist_lname: { type: String, required: true, trim: true },
    dentist_specialty: { type: String, required: true, trim: true },
    dentist_phone: { type: String, trim: true, default: '' },
    dentist_email: { type: String, trim: true, lowercase: true, default: '' },
  },
  { timestamps: true, collection: 'dentists' }
);

export default mongoose.model('Dentist', dentistSchema);

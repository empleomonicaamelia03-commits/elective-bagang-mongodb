import mongoose from 'mongoose';

// ERD entity: SERVICES   (service_id = the document's _id)
const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true }, // short key the website sends, e.g. "cleaning"
    service_name: { type: String, required: true, trim: true },
    service_cost: { type: Number, required: true, min: 0 },
    service_duration_minutes: { type: Number, required: true, min: 5, default: 60 },
  },
  { timestamps: true, collection: 'services' }
);

export default mongoose.model('Service', serviceSchema);

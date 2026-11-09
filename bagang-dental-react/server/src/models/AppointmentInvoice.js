import mongoose from 'mongoose';

const { Schema } = mongoose;

// ERD entity: APPOINTMENT INVOICE   (invoice_id = the document's _id)
// One invoice per appointment, created together with it.
const invoiceSchema = new Schema(
  {
    app_id: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    service_cost: { type: Number, required: true, min: 0 }, // price at the time of booking
    patient_paid: { type: Number, default: 0, min: 0 }, // total received so far
    total_due: { type: Number, required: true, min: 0 }, // balance still owed = service_cost - patient_paid
    payment_date: { type: Date, default: null }, // date of the latest payment
    is_paid: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'appointment_invoices' }
);

export default mongoose.model('AppointmentInvoice', invoiceSchema);

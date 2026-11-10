import nodemailer from 'nodemailer';

let transporter;
function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: (Number(SMTP_PORT) || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    // Dev fallback so the flow still works without SMTP credentials.
    console.warn(`[mailer] SMTP not configured. Email to ${to}:\n${subject}\n${text}\n`);
    if (process.env.NODE_ENV === 'production') throw new Error('Email is not configured on the server.');
    return;
  }
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
}

export const sendQueueEmail = (to, b) =>
  sendMail({
    to,
    subject: `Your Bag-ang Dental booking number: #${b.number}`,
    text:
      `Hi ${b.firstName},\n\nYour appointment is confirmed.\n\n` +
      `Booking number: ${b.number}\nService: ${b.serviceName}\nDentist: ${b.dentistName}\n` +
      `Date: ${b.appointmentDate} at ${b.appointmentTime}\nPayment: cash, Php ${Number(b.total).toLocaleString()}\n\n` +
      `Use the 4-digit booking number in "Check Queue" on our website.\n\nBag-ang Dental Clinic`,
    html: `<h2>Appointment confirmed</h2>
      <p>Hi ${b.firstName}, your booking number is:</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:6px">#${b.number}</p>
      <p><b>Service:</b> ${b.serviceName}<br><b>Dentist:</b> ${b.dentistName}<br>
      <b>Date:</b> ${b.appointmentDate} at ${b.appointmentTime}<br>
      <b>Payment:</b> cash, Php ${Number(b.total).toLocaleString()}</p>
      <p>Use this number in <b>Check Queue</b> on our website.</p>`,
  });

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { services, dentists, timeSlots } from '../data/clinic.js';
import { createBooking, getBooking } from '../api.js';

const emptyForm = {
  pfirstName: '',
  plastName: '',
  patientemail: '',
  patientcontact: '',
  dateOfBirth: '',
  service: '',
  dentist: '',
  appointmentDate: '',
  appointmentTime: '',
};

const serviceOptions = services.map((s) => ({
  id: s.id,
  label: `${s.bookingName || s.name} - ${s.bookingLabel}`,
  cost: s.cost,
}));

const dentistOptions = dentists.map((d) => ({
  id: d.id,
  label: `Dr. ${d.name} - ${d.focus}`,
}));

const isSunday = (value) => value && new Date(`${value}T00:00:00`).getDay() === 0;

const formatTime = (value) => (timeSlots.find(([v]) => v === value) || [, value])[1];

const peso = (n) => `Php ${Number(n).toLocaleString()}`;

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Book() {
  const [tab, setTab] = useState('book');

  return (
    <main className="booking-main">
      <div className="booking-tabs">
        <button type="button" className={`tab-btn ${tab === 'book' ? 'active' : ''}`} onClick={() => setTab('book')}>
          📅 Book New
        </button>
        <button type="button" className={`tab-btn ${tab === 'queue' ? 'active' : ''}`} onClick={() => setTab('queue')}>
          🔍 Check Queue
        </button>
      </div>

      {tab === 'book' ? <BookingForm /> : <QueueCheck />}
    </main>
  );
}

function BookingForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const minDate = useMemo(tomorrowISO, []);

  const cost = serviceOptions.find((s) => s.id === form.service)?.cost || 0;

  const update = (e) => {
    const { name, value } = e.target;
    if (name === 'appointmentDate' && isSunday(value)) {
      window.alert('❌ Clinic is CLOSED on Sundays.\nPlease select Monday - Saturday.');
      setForm((f) => ({ ...f, appointmentDate: '' }));
      return;
    }
    setError('');
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isSunday(form.appointmentDate)) {
      setError('Sunday bookings not allowed. Clinic closed.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const saved = await createBooking(form);
      setSuccess({
        ...form,
        number: saved.number,
        serviceLabel: saved.serviceName,
        dentistLabel: saved.dentistName,
        total: saved.total,
        emailSent: saved.emailSent,
      });
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="booking-header">
        <p className="eyebrow">BAG-ANG DENTAL CLINIC</p>
        <h1>Book Your Appointment</h1>
        <p className="lead">Complete the form below to schedule your dental appointment.</p>
      </section>

      <section className="booking-form-section">
        <form className="booking-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="pfirstName">First Name *</label>
              <input type="text" id="pfirstName" name="pfirstName" value={form.pfirstName} onChange={update} required />
            </div>
            <div className="form-group">
              <label htmlFor="plastName">Last Name *</label>
              <input type="text" id="plastName" name="plastName" value={form.plastName} onChange={update} required />
            </div>
            <div className="form-group">
              <label htmlFor="patientemail">Email *</label>
              <input type="email" id="patientemail" name="patientemail" value={form.patientemail} onChange={update} required />
            </div>
            <div className="form-group">
              <label htmlFor="patientcontact">Contact Number *</label>
              <input
                type="tel"
                id="patientcontact"
                name="patientcontact"
                value={form.patientcontact}
                onChange={update}
                placeholder="+63 917 123 4567"
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={form.dateOfBirth} onChange={update} required />
            </div>

            <div className="form-group full-width">
              <label htmlFor="service">Service Type *</label>
              <select id="service" name="service" value={form.service} onChange={update} required>
                <option value="">Select a service</option>
                {serviceOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="dentist">Dentist *</label>
              <select id="dentist" name="dentist" value={form.dentist} onChange={update} required>
                <option value="">Select a dentist</option>
                {dentistOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointmentDate">
                Preferred Date * <small>(Mon-Sat only)</small>
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={update}
                min={minDate}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="appointmentTime">Preferred Time *</label>
              <select id="appointmentTime" name="appointmentTime" value={form.appointmentTime} onChange={update} required>
                <option value="">Select time</option>
                {timeSlots.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="payment-section">
            <h3>💰 Payment Information</h3>
            <p><strong>Cash payment only</strong> - Please bring exact change if possible.</p>
            <div className="payment-summary">
              <div className="summary-item">
                <span>Service Cost:</span>
                <span>{peso(cost)}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount (Cash):</span>
                <span>{peso(cost)}</span>
              </div>
            </div>
          </div>

          {error && <p className="form-error" role="alert">❌ {error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? '⏳ Processing...' : '✅ Confirm Booking'}
            </button>
          </div>
        </form>
      </section>

      <section className="booking-info">
        <div className="info-card">
          <h3>🕒 Clinic Hours</h3>
          <p><strong>Monday - Saturday:</strong> 8:00 AM - 5:00 PM</p>
          <p><strong>Sunday:</strong> <span style={{ color: '#ef4444' }}>Closed</span></p>
        </div>
        <div className="info-card">
          <h3>📱 Confirmation</h3>
          <p>
            ✅ Your booking number is emailed to you right after booking<br />
            📱 <strong>Save your 4-digit booking number!</strong><br />
            🔍 Use "Check Queue" tab to track status
          </p>
        </div>
      </section>

      {success && (
        <SuccessModal booking={success} onClose={() => setSuccess(null)} onContact={() => navigate('/contact')} />
      )}
    </>
  );
}

function SuccessModal({ booking, onClose, onContact }) {
  useEffect(() => {
    const t = setTimeout(onClose, 60000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="booking-success-modal" role="dialog" aria-modal="true">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h2>Appointment Confirmed!</h2>
        <p className="success-subtitle">Your booking has been successfully scheduled.</p>

        <div className="booking-summary">
          <div className="summary-row highlight">
            <span>🔢 Booking Number</span>
            <span>#{booking.number}</span>
          </div>
          <div className="summary-row">
            <span>👤 {booking.pfirstName} {booking.plastName}</span>
            <span>📧 {booking.patientemail}</span>
          </div>
          <div className="summary-row">
            <span>📞 {booking.patientcontact}</span>
            <span>🎂 {booking.dateOfBirth}</span>
          </div>
          <div className="summary-row">
            <span>🦷 {booking.serviceLabel}</span>
            <span>👩‍⚕️ {booking.dentistLabel}</span>
          </div>
          <div className="summary-row highlight">
            <span>📅 {booking.appointmentDate}</span>
            <span>🕒 {formatTime(booking.appointmentTime)}</span>
          </div>
          <div className="summary-row highlight">
            <span>💰 Cash Payment</span>
            <span>{peso(booking.total)}</span>
          </div>
        </div>

        <div className="confirmation-details">
          <p><strong>📌 Save your booking number:</strong> #{booking.number} (use it in "Check Queue")</p>
          <p>
            <strong>📧 Confirmation Email:</strong>{' '}
            {booking.emailSent
              ? `Sent to ${booking.patientemail}`
              : 'Could not be sent. Please save your booking number above.'}
          </p>
        </div>

        <div className="success-actions">
          <button type="button" onClick={onContact} className="secondary-btn">Contact Us</button>
          <button type="button" onClick={onClose} className="primary-btn">Book Another</button>
        </div>
      </div>
    </div>
  );
}

const statusMeta = {
  waiting: { label: '⏳ Waiting', cls: 'waiting' },
  ready: { label: '✅ Ready', cls: 'ready' },
  completed: { label: '🎉 Completed', cls: 'ready' },
  cancelled: { label: '❌ Cancelled', cls: 'cancelled' },
};

function QueueCheck() {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(number)) return;
    setLoading(true);
    setBooking(null);
    setError('');
    try {
      setBooking(await getBooking(number));
    } catch (err) {
      setError(err.status === 404 ? "We couldn't find a booking with that number. Please double-check your confirmation." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const meta = booking ? statusMeta[booking.status] || statusMeta.waiting : null;

  return (
    <>
      <section className="queue-header">
        <h2>Check Your Queue Status</h2>
        <p className="lead">
          Enter your <strong>4-digit booking number</strong> to see your appointment status and queue position.
        </p>
      </section>

      <section className="queue-check-section">
        <div className="queue-form-container">
          <form className="queue-check-form" onSubmit={submit}>
            <div className="form-group full-width queue-input-group">
              <label htmlFor="bookingNumber">4-Digit Booking Number *</label>
              <input
                type="text"
                id="bookingNumber"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="e.g. 1234"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
              <small>Check your SMS/Email confirmation for your booking number</small>
            </div>
            <button type="submit" className="primary-button queue-btn" disabled={loading}>
              🔍 Check Status
            </button>
          </form>
        </div>

        {(loading || booking || error) && (
          <div className="queue-results">
            {loading && (
              <div className="status-loading">
                <div className="loading-spinner" />
                <p>Checking your queue status...</p>
              </div>
            )}

            {error && (
              <div className="status-card cancelled">
                <h3>Booking #{number}</h3>
                <p>{error}</p>
              </div>
            )}

            {booking && (
              <div className={`status-card ${meta.cls}`}>
                <h3>Booking #{booking.number}</h3>
                <div className="status-indicator">{meta.label}</div>
                {booking.position && <p><strong>Position:</strong> #{booking.position} in queue</p>}
                <p><strong>Service:</strong> {booking.serviceName}</p>
                <p><strong>Dentist:</strong> {booking.dentistName}</p>
                <p><strong>Scheduled:</strong> {booking.appointmentDate}, {formatTime(booking.appointmentTime)}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="queue-info">
        <div className="info-card">
          <h3>📊 Queue Status Legend</h3>
          <ul>
            <li><span className="status-waiting">⏳ Waiting</span> - In queue</li>
            <li><span className="status-ready">✅ Ready</span> - Next to be called</li>
            <li><span className="status-completed">🎉 Completed</span> - Appointment finished</li>
            <li><span className="status-cancelled">❌ Cancelled</span> - Booking cancelled</li>
          </ul>
        </div>
      </section>
    </>
  );
}

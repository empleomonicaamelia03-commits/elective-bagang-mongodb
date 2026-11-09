import { Link } from 'react-router-dom';
import { services, dentists } from '../data/clinic.js';

export default function Services() {
  return (
    <main className="services-main">
      <section className="services-header">
        <p className="eyebrow">BAG-ANG DENTAL CLINIC</p>
        <h1>Our Services</h1>
        <p className="lead">
          We offer a comprehensive range of dental services to keep your smile healthy and beautiful.
        </p>
      </section>

      <section className="services-grid">
        {services.map((s) => (
          <div className="service-card" key={s.id}>
            <div className="service-icon">{s.icon}</div>
            <h3>{s.name}</h3>
            <p className="service-description">{s.description}</p>
            <div className="service-details">
              <div className="detail-item">
                <span className="label">Cost:</span>
                <span className="value">{s.costLabel}</span>
              </div>
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">{s.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="dentists-section">
        <h2>Our Dentists</h2>
        <div className="dentists-grid">
          {dentists.map((d) => (
            <div className="dentist-card" key={d.id}>
              <div className="dentist-avatar">{d.initials}</div>
              <h3>{d.name}</h3>
              <p className="dentist-title">{d.title}</p>
              <p className="dentist-bio">{d.bio}</p>
              <ul className="dentist-info-list">
                {d.info.map(([label, value]) => (
                  <li key={label}><strong>{label}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="availability-section">
        <h2>Hours of Availability</h2>
        <div className="availability-container">
          <div className="availability-info">
            <p><strong>Monday - Saturday:</strong> 8:00 AM - 5:00 PM</p>
            <p><strong>Sunday:</strong> Closed</p>
            <p className="note">We're ready to serve you during all business hours. Walk-ins are welcome!</p>
          </div>
        </div>
      </section>

      <section className="booking-section">
        <h2>Ready to Smile?</h2>
        <p>Select a service and proceed to book an appointment.</p>
        <div className="booking-buttons">
          <Link to="/book" className="primary-button">Book an Appointment</Link>
        </div>
      </section>
    </main>
  );
}

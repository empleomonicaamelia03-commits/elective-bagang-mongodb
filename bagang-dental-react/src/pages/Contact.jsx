import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CLINIC } from '../data/clinic.js';
import { sendContactMessage } from '../api.js';

// Vite doesn't resolve Leaflet's default icon paths, so set them explicitly.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const initialForm = { name: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const mapRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const map = L.map(mapRef.current).setView(CLINIC.coords, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const popup = document.createElement('div');
    popup.style.cssText = "text-align:center;font-family:'Inter',sans-serif;";
    popup.innerHTML = `
      <b style="color:#2d0e64;">🦷 Bag-ang Dental Clinic</b><br>
      <small>USTP Campus, C.M. Recto, Lapasan</small><br>
      Cagayan de Oro City 9000<br>
      <strong>Mon-Sat: 8AM-5PM</strong><br><br>
      <a href="${CLINIC.phoneHref}" style="color:#10b981;text-decoration:none;">📞 ${CLINIC.phone}</a>
    `;

    L.marker(CLINIC.coords).addTo(map).bindPopup(popup).openPopup();

    return () => map.remove();
  }, []);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendContactMessage(form);
      window.alert("✅ Message sent successfully!\n\nWe'll get back to you within 24 hours. 😊");
      setForm(initialForm);
    } catch (err) {
      window.alert(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="contact-main">
      <section className="contact-hero">
        <div className="contact-copy">
          <p className="eyebrow">GET IN TOUCH</p>
          <h1>Ready to start your<br />smile journey?</h1>
          <p className="lead">We're here to help. Reach out and let's create your perfect smile together.</p>
        </div>
      </section>

      <section className="contact-grid">
        <div className="contact-details">
          <div className="contact-card phone">
            <div className="contact-icon">📞</div>
            <h3>Call Us</h3>
            <p className="contact-value"><a href={CLINIC.phoneHref}>{CLINIC.phone}</a></p>
            <p className="contact-hours">Mon-Sat 8AM-5PM</p>
          </div>

          <div className="contact-card email">
            <div className="contact-icon">✉️</div>
            <h3>Email Us</h3>
            <p className="contact-value"><a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a></p>
            <p className="contact-hours">Response within 24hrs</p>
          </div>

          <div className="contact-card social">
            <div className="contact-icon">📱</div>
            <h3>Follow Us</h3>
            <ul className="social-links">
              <li><a href="https://facebook.com/bagangdental" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com/bagangdental" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com/@bagangdental" target="_blank" rel="noreferrer">TikTok</a></li>
            </ul>
          </div>
        </div>

        <div className="contact-form-container">
          <div className="contact-card form-card">
            <h3>Send us a message</h3>
            <form className="contact-form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="contactName">Full Name</label>
                <input type="text" id="contactName" name="name" value={form.name} onChange={update} required />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Phone (Optional)</label>
                <input type="tel" id="contactPhone" name="phone" value={form.phone} onChange={update} />
              </div>

              <div className="form-group">
                <label htmlFor="contactSubject">Subject</label>
                <select id="contactSubject" name="subject" value={form.subject} onChange={update} required>
                  <option value="">Choose a subject</option>
                  <option value="Appointment Booking">Appointment Booking</option>
                  <option value="Service Inquiry">Service Inquiry</option>
                  <option value="Price Quote">Price Quote</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactMessage">Message</label>
                <textarea
                  id="contactMessage"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={update}
                  placeholder="Tell us about your dental needs..."
                  required
                />
              </div>

              <button type="submit" className="primary-button" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="location-section">
        <div className="location-header">
          <h2>Visit Us</h2>
          <p>
            Bag-ang Dental Clinic<br />
            University of Science and Technology of Southern Philippines (USTP)<br />
            C.M. Recto, Lapasan, Cagayan de Oro City<br />
            Misamis Oriental 9000, Philippines
          </p>
        </div>
        <div className="map-container" ref={mapRef} />
      </section>
    </main>
  );
}

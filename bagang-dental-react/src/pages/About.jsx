import featurelist from '../assets/featurelist1.png';

export default function About() {
  return (
    <section className="about-section">
      <div className="about-grid">
        <div className="about-copy">
          <p className="eyebrow">Our story</p>
          <h2 className="about-title">Where advanced dentistry meets calm, reassuring care.</h2>
          <p className="about-lead">
            We combine refined aesthetics and precise treatment planning to make each smile transformation feel effortless and approachable.
          </p>
        </div>

        <div className="feature-list">
          <img src={featurelist} alt="Tailored treatment plans" />
          <div className="feature-item">Premium orthodontic care made accessible</div>
          <div className="feature-item">Comfort-first service from start to finish</div>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-stats">
          <div className="stat-card">
            <strong>15+</strong>
            <p>Years of collective experience in orthodontics and aesthetic dentistry.</p>
          </div>
          <div className="stat-card">
            <strong>98%</strong>
            <p>Patient satisfaction from families and professionals who trust our care.</p>
          </div>
        </div>

        <div className="about-quote">
          <blockquote>
            "We believe great dental care should feel luxurious, reliable, and deeply human — from every checkup to every smile reveal."
          </blockquote>
          <cite>— Dr. Monica Empleo, Founder</cite>
        </div>
      </div>

      <div className="about-details">
        <p className="eyebrow">Our specialists</p>
        <div className="team-grid">
          <div className="team-card">
            <h3>Dr. Monica Empleo</h3>
            <p>Lead orthodontist focused on smile architecture and precision aligner therapy.</p>
          </div>
          <div className="team-card">
            <h3>Fvienj Nopuente</h3>
            <p>Clinical aesthetic dentist specializing in cosmetic smile enhancement.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import tooth from '../assets/tooth.png';

export default function Home() {
  return (
    <main className="hero">
      <section className="hero-copy">
        <p className="eyebrow">BAG-ANG DENTAL CLINIC</p>
        <h1>
          Smile with <br />confidence,<br />your teeth are <br />in good hands
        </h1>
        <p className="lead">
          We are a premium orthodontic and aesthetic studio crafting confident smiles for those who settle for nothing ordinary.
        </p>
        <Link className="primary-button" to="/book">Schedule a visit</Link>
      </section>

      <section className="hero-visual">
        <div className="hero-panel">
          <img className="hero-image" src={tooth} alt="Dental tooth illustration" />
          <div className="hero-panel-copy">
            <p className="panel-label">Luxury care made personal</p>
          </div>
        </div>
      </section>
    </main>
  );
}

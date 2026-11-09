import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/book', label: 'Book Appointment' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="page-shell">
      <header className="site-header">
        <Link className="brand" to="/">Bag-ang Dental Clinic</Link>
        <nav className="site-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Bag-ang Dental Clinic. USTP Cagayan de Oro. All rights reserved.</p>
          <p>📍 Located at University of Science and Technology of Southern Philippines</p>
        </div>
      </footer>
    </div>
  );
}

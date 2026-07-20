import { useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/navbarlogo_clientpage.png';
import SearchRibbon from './SearchRibbon';

const baseTopLinks = [
  { label: 'Help', to: '/help-center' },
  { label: 'Counselling', to: '/counselling' },
  { label: 'Ecommerce Order Page', to: '/ecommerce-orders' }
];

const orderTopLinks = [
  { label: 'Ecommerce Order Page', to: '/ecommerce-orders' }
];

const accountTopLinks = [
  { label: 'Student Login', to: '/student-login' }
];

const bottomLinks = [
  { label: 'School', to: '/startingeducation' },
  { label: 'College', to: '/highereducation' },
  { label: 'Coaching Center', to: '/additionaleducation' },
  { label: 'Ecommerce Home', to: '/ecommerce' }
];

export default function AppShellMainOnly() {
  const location = useLocation();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const lastScrollYRef = useRef(0);

  const topLinks = location.pathname.startsWith('/ecommerce-orders')
    ? [...baseTopLinks.slice(0, 2), ...orderTopLinks, ...accountTopLinks]
    : [...baseTopLinks, ...accountTopLinks];
  const isEcommerceArea = location.pathname.startsWith('/ecommerce');

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsHeaderScrolled(currentScroll > 8);
      lastScrollYRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setIsHeaderScrolled(window.scrollY > 8);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <Navbar
        expand="lg"
        className={`top-navbar py-3 ${isHeaderScrolled ? 'shadow-sm' : ''}`}
      >
        {/* Logo */}
          <Navbar.Brand
            as={NavLink}
            to="/home"
            className="brand-mark"
          >
            <img
              src={logo}
              alt="ClassGain"
              className="brand-mark__logo"
            />
          </Navbar.Brand>
        <Container fluid="xl">
          

          <Navbar.Toggle
            aria-controls="top-nav"
            className="border-0 shadow-none"
          />

          <Navbar.Collapse id="top-nav" className="justify-content-end">
            <Nav className="align-items-lg-center gap-lg-2 text-lg-end">
              {topLinks.map((link) =>
                link.href ? (
                  <Nav.Link
                    key={link.label}
                    href={link.href}
                    className="top-nav-link"
                  >
                    {link.label}
                  </Nav.Link>
                ) : (
                  <Nav.Link
                    as={NavLink}
                    key={link.label}
                    to={link.to}
                    className="top-nav-link"
                  >
                    {link.label}
                  </Nav.Link>
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Bottom Navbar */}
      <Navbar expand="lg" className="section-navbar py-2">
        <Container fluid="xl">
          <Nav className="section-nav w-100 justify-content-between gap-2 flex-wrap">
            {bottomLinks.map((link) => (
              <Nav.Link
                as={NavLink}
                key={link.label}
                to={link.to}
                className="section-nav-link flex-fill text-center"
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </Navbar>

      {!isEcommerceArea ? <SearchRibbon /> : null}

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/navbarlogo_educationteam.png';

const topLinks = [
  { label: 'Education Center Help', to: '/education-center/help' },
  { label: 'Education Center Login', to: '/education-center/login' },
  { label: 'Upload Profile', to: '/education-center-upload' },
  { label: 'Creator Channel', to: '/video-uploader-channel' }
];

export default function AppShellMainOnly() {
  const location = useLocation();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const lastScrollYRef = useRef(0);

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
      <Navbar expand="lg" className="top-navbar py-3">
        <Container fluid="xl">
          <Navbar.Brand as={NavLink} to="/education-center/login" className="brand-mark">
            <img src={logo} alt="ClassGain Education Team" className="brand-mark__logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="top-nav" className="border-0 shadow-none" />
          <Navbar.Collapse id="top-nav" className="justify-content-end">
            <Nav className="align-items-lg-center gap-lg-2 text-lg-end">
              {topLinks.map((link) => (
                <Nav.Link as={NavLink} key={link.label} to={link.to} className="top-nav-link">
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <header className={`site-header sticky-top ${isHeaderScrolled ? 'site-header--scrolled' : ''}`}>
        <Navbar expand="lg" className="section-navbar py-2">
          <Container fluid="xl">
            <Nav className="section-nav w-100 justify-content-between gap-2 flex-wrap">
              {topLinks.map((link) => (
                <Nav.Link as={NavLink} key={link.label} to={link.to} className="section-nav-link flex-fill text-center">
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
          </Container>
        </Navbar>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

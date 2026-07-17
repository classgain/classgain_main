import { useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const topLinks = [
  { label: 'Help', to: '/help-center' },
  { label: 'Counselling', to: '/counselling' },
  { label: 'Education Center Login', to: '/education-center-login' },
  { label: 'Student Login', to: '/student-login' }
];

const bottomLinks = [
  { label: 'Starting Education', to: '/startingeducation' },
  { label: 'Higher Education', to: '/highereducation' },
  { label: 'Addisnal Education', to: '/additionaleducation' },
  { label: 'Video Education', to: '/video-education' }
];

export default function AppShell() {
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
      <header className={`site-header sticky-top ${isHeaderScrolled ? 'site-header--scrolled' : ''}`}>
        <Navbar expand="lg" className="top-navbar py-3">
          <Container fluid="xl">
            <Navbar.Brand as={NavLink} to="/home" className="brand-mark">
              <span className="brand-mark__text">class</span>
              <span className="brand-mark__badge">gain</span>
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

        <Navbar expand="lg" className="section-navbar py-2">
          <Container fluid="xl">
            <Nav className="section-nav w-100 justify-content-between gap-2 flex-wrap">
                {bottomLinks.map((link) => (
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

import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/navbarlogo_educationteam.png';

const topLinks = [
  { label: 'Education Center Help', to: '/education-center/help' },
  { label: 'Education Center Login', to: '/education-center/login' }
];

export default function AppShellMainOnly() {
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

      <main>
        <Outlet />
      </main>
    </div>
  );
}

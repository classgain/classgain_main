import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginStudent, signupStudent } from '../services/api';
import { readBuyerSession, saveBuyerSession } from '../services/buyerSession';
import './Loginpage-Design.css';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

function buildSession(responseData) {
  const token = responseData?.token || responseData?.session?.token;
  const user = responseData?.user || responseData?.session?.user;

  return token && user?.email ? { token, user } : null;
}

export default function EcommerceLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [existingSession] = useState(() => readBuyerSession());
  const [authMode, setAuthMode] = useState('signin');
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    type: 'info',
    message: location.state?.message || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (existingSession?.token) {
    return <Navigate to="/buyer-orders" replace />;
  }

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setForm(initialForm);
    setStatus({ type: '', message: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const isSignup = authMode === 'signup';

    if (isSignup && !name) {
      setStatus({ type: 'error', message: 'Please enter the parent or buyer full name.' });
      return;
    }

    if (!email || !password) {
      setStatus({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (isSignup && password !== form.confirmPassword.trim()) {
      setStatus({ type: 'error', message: 'Password confirmation does not match.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = isSignup ? { name, email, password } : { email, password };
      const responseData = isSignup
        ? await signupStudent(payload)
        : await loginStudent(payload);
      const session = buildSession(responseData);

      if (!session) {
        throw new Error('Buying session could not be created. Please try again.');
      }

      saveBuyerSession(session);
      navigate('/buyer-orders', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to complete the request right now.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTone = status.type || 'info';

  return (
    <div className="student-auth-page buyer-auth-page">
      {status.message ? (
        <div className={`dashboard-page__status dashboard-page__status--${statusTone}`}>
          {status.message}
        </div>
      ) : null}

      <div className="student-auth-grid">
        <section className="student-auth-intro">
          <p className="student-auth-intro__eyebrow">Ecommerce Buying Login</p>
          <h1>One focused place for parent and buyer orders</h1>
          <p>
            Sign in to buy education products for your child and view only the
            related order, payment, delivery, and tracking information.
          </p>

          <div className="student-auth-metrics">
            <article className="student-auth-metric">
              <strong>100%</strong>
              <span>Order focused</span>
            </article>
            <article className="student-auth-metric">
              <strong>24/7</strong>
              <span>Order access</span>
            </article>
            <article className="student-auth-metric">
              <strong>Private</strong>
              <span>Buyer session</span>
            </article>
          </div>

          <div className="student-auth-highlights">
            <div className="student-auth-highlight">
              <strong>Parent-friendly buying</strong>
              <span>Purchase books, notes, school supplies, and learning products.</span>
            </div>
            <div className="student-auth-highlight">
              <strong>Order-only dashboard</strong>
              <span>No student profile, courses, certificates, or social panels are shown.</span>
            </div>
            <div className="student-auth-highlight">
              <strong>Clear delivery tracking</strong>
              <span>See payment status, delivery address, and every order step.</span>
            </div>
          </div>

          <div className="dashboard-page__actions">
            <Link to="/ecommerce" className="dashboard-page__button">Browse Products</Link>
            <Link to="/student-login" className="dashboard-page__button dashboard-page__button--ghost">
              Student Login
            </Link>
          </div>
        </section>

        <section className="student-auth-card">
          <div className="student-auth-card__toggle" role="tablist" aria-label="Buyer account action">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signin'}
              className={authMode === 'signin' ? 'student-auth-card__toggle-button student-auth-card__toggle-button--active' : 'student-auth-card__toggle-button'}
              onClick={() => handleModeChange('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signup'}
              className={authMode === 'signup' ? 'student-auth-card__toggle-button student-auth-card__toggle-button--active' : 'student-auth-card__toggle-button'}
              onClick={() => handleModeChange('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="student-auth-form" onSubmit={handleSubmit}>
            <p className="portal-form__eyebrow">Parent &amp; Buyer Access</p>
            <h2>{authMode === 'signup' ? 'Create Buying Account' : 'Welcome Back'}</h2>
            <p className="student-auth-form__text">
              {authMode === 'signup'
                ? 'Create a separate buying account to place purchases and track orders.'
                : 'Sign in to open your clean order-only dashboard.'}
            </p>

            {authMode === 'signup' ? (
              <label className="portal-form__field">
                <span>Parent or buyer full name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  autoComplete="name"
                />
              </label>
            ) : null}

            <label className="portal-form__field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="buyer@example.com"
                autoComplete="email"
              />
            </label>

            <label className="portal-form__field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>

            {authMode === 'signup' ? (
              <label className="portal-form__field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </label>
            ) : null}

            <div className="student-auth-form__meta">
              <span>This session opens only the ecommerce buying dashboard.</span>
            </div>

            <div className="portal-form__actions">
              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting
                  ? authMode === 'signup' ? 'Creating account...' : 'Signing in...'
                  : authMode === 'signup' ? 'Create Buying Account' : 'Open Buying Dashboard'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerEducationCenter } from '../services/api';
import './Loginpage-Design.css';

const categoryOptions = ['School', 'College', 'Coaching Center'];
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const initialRegistrationForm = {
  educationCenterName: '',
  ownerName: '',
  category: '',
  email: '',
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  username: '',
  password: '',
  confirmPassword: '',
  registrationCertificate: '',
  idProof: '',
  addressProof: '',
  logo: ''
};

const uploadFields = [
  { key: 'registrationCertificate', label: 'Registration certificate', accept: 'image/*,.pdf' },
  { key: 'idProof', label: 'ID proof', accept: 'image/*,.pdf' },
  { key: 'addressProof', label: 'Address proof', accept: 'image/*,.pdf' },
  { key: 'logo', label: 'Logo', accept: 'image/*' }
];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EducationCenterRegistrationPage() {
  const [formData, setFormData] = useState(initialRegistrationForm);
  const [uploadNames, setUploadNames] = useState({});
  const [logoPreview, setLogoPreview] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const handleUploadChange = async (event, key) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((current) => ({ ...current, [key]: '' }));
      setUploadNames((current) => ({ ...current, [key]: '' }));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      event.target.value = '';
      setFormData((current) => ({ ...current, [key]: '' }));
      setUploadNames((current) => ({ ...current, [key]: '' }));
      setStatus({ type: 'error', message: `${file.name} is larger than the 100 MB upload limit.` });
      return;
    }

    try {
      const fileData = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, [key]: fileData }));
      setUploadNames((current) => ({ ...current, [key]: file.name }));

      if (key === 'logo') {
        setLogoPreview(fileData);
      }
    } catch (_error) {
      setStatus({ type: 'error', message: `${file.name} could not be loaded. Please try another file.` });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const requiredKeys = Object.keys(initialRegistrationForm).filter((key) => key !== 'alternatePhone' && key !== 'logo');
    const missingRequiredField = requiredKeys.some((key) => !String(formData[key]).trim());

    if (missingRequiredField) {
      setStatus({ type: 'error', message: 'Please complete all required registration fields and document uploads.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Password confirmation does not match.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await registerEducationCenter(formData);
      setFormData(initialRegistrationForm);
      setUploadNames({});
      setLogoPreview('');
      setStatus({
        type: 'success',
        message: response.message || 'Education center registration submitted. Your account is pending admin approval.'
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to submit registration right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-page education-request-page">
      <section className="dashboard-page__hero">
        <div>
          <p className="dashboard-page__eyebrow">Education Center Registration</p>
          <h1 className="dashboard-page__title">Register for admin approval.</h1>
          <p className="dashboard-page__text">
            Submit center details, owner information, login credentials, and proof documents. Approved centers can log
            in and appear on the client side.
          </p>
        </div>
        <div className="dashboard-page__actions">
          <Link to="/education-center/login" className="dashboard-page__button dashboard-page__button--ghost">
            Already Registered
          </Link>
        </div>
      </section>

      {status.message ? (
        <div className={`dashboard-page__status dashboard-page__status--${status.type || 'info'}`}>
          {status.message}
        </div>
      ) : null}

      <section className="portal-form-card portal-form-card--wide">
        <form className="portal-form education-request-form" onSubmit={handleSubmit}>
          <p className="portal-form__eyebrow">Approval Request</p>
          <h2>Education Center Details</h2>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Education center name</span>
              <input
                type="text"
                name="educationCenterName"
                value={formData.educationCenterName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="portal-form__field">
              <span>Owner name</span>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
            </label>
          </div>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Category</span>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="portal-form__field">
              <span>Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>
          </div>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Phone</span>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </label>

            <label className="portal-form__field">
              <span>Alternate phone</span>
              <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} />
            </label>
          </div>

          <label className="portal-form__field">
            <span>Address</span>
            <textarea name="address" rows="3" value={formData.address} onChange={handleChange} required />
          </label>

          <div className="portal-form__three">
            <label className="portal-form__field">
              <span>City</span>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </label>

            <label className="portal-form__field">
              <span>State</span>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required />
            </label>

            <label className="portal-form__field">
              <span>Pincode</span>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
            </label>
          </div>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Username</span>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </label>

            <label className="portal-form__field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </label>
          </div>

          <label className="portal-form__field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="6"
              required
            />
          </label>

          <div className="education-upload-grid">
            {uploadFields.map((field) => (
              <label key={field.key} className="portal-form__field">
                <span>{field.label}</span>
                <input
                  type="file"
                  accept={field.accept}
                  onChange={(event) => handleUploadChange(event, field.key)}
                  required={!['logo'].includes(field.key)}
                />
                {uploadNames[field.key] ? <small className="portal-form__hint">{uploadNames[field.key]}</small> : null}
                <small className="portal-form__hint">Maximum file size: 100 MB</small>
              </label>
            ))}
          </div>

          {logoPreview ? <img className="portal-form__preview portal-form__preview--small" src={logoPreview} alt="Logo preview" /> : null}

          <div className="portal-form__actions">
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

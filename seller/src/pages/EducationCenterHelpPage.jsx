import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSupportTicketStatus, submitEducationCenterHelpTicket } from '../services/api';
import './Loginpage-Design.css';

const categoryOptions = ['School', 'College', 'Coaching Center'];

const complaintTypeOptions = [
  'Technical Issue',
  'Account Issue',
  'Payment Issue',
  'General Inquiry',
  'Other'
];

const initialHelpForm = {
  educationCenterName: '',
  ownerName: '',
  category: '',
  phoneNumber: '',
  email: '',
  address: '',
  subject: '',
  complaintType: '',
  howCanWeHelp: '',
  fullDetails: '',
  attachment: ''
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EducationCenterHelpPage() {
  const [formData, setFormData] = useState(initialHelpForm);
  const [attachmentName, setAttachmentName] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookup, setLookup] = useState({ ticketId: '', email: '' });
  const [ticketStatus, setTicketStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((current) => ({ ...current, attachment: '' }));
      setAttachmentName('');
      return;
    }

    try {
      const attachment = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, attachment }));
      setAttachmentName(file.name);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Attachment could not be loaded. Please try another file.' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const missingField = Object.entries(formData).some(([key, value]) => key !== 'attachment' && !String(value).trim());

    if (missingField) {
      setStatus({ type: 'error', message: 'Please complete all required help fields.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitEducationCenterHelpTicket(formData);
      setLookup({ ticketId: response.ticketId || '', email: formData.email });
      setTicketStatus({ ticketId: response.ticketId, status: 'Open', reply: '' });
      setFormData(initialHelpForm);
      setAttachmentName('');
      setStatus({
        type: 'success',
        message: response.message || `Help ticket ${response.ticketId} submitted successfully.`
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to submit your help request right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketLookup = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchSupportTicketStatus('education-center', lookup.ticketId, lookup.email);
      setTicketStatus(response.ticket);
      setStatus({ type: '', message: '' });
    } catch (error) {
      setTicketStatus(null);
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="portal-page education-request-page">
      <section className="dashboard-page__hero">
        <div>
          <p className="dashboard-page__eyebrow">Education Center Help</p>
          <h1 className="dashboard-page__title">Send a support ticket to What Next.</h1>
          <p className="dashboard-page__text">
            Share your center details, issue category, and full notes. The support team can track the request by ticket
            ID after submission.
          </p>
        </div>
        <div className="dashboard-page__actions">
          <Link to="/education-center/login" className="dashboard-page__button dashboard-page__button--ghost">
            Back to Login
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
          <p className="portal-form__eyebrow">Support Form</p>
          <h2>Education Center Help</h2>

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
          </div>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Phone number</span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </label>

            <label className="portal-form__field">
              <span>Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>
          </div>

          <label className="portal-form__field">
            <span>Address</span>
            <textarea name="address" rows="3" value={formData.address} onChange={handleChange} required />
          </label>

          <div className="portal-form__split">
            <label className="portal-form__field">
              <span>Subject</span>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
            </label>

            <label className="portal-form__field">
              <span>Complaint type</span>
              <select name="complaintType" value={formData.complaintType} onChange={handleChange} required>
                <option value="">Select complaint type</option>
                {complaintTypeOptions.map((complaintType) => (
                  <option key={complaintType} value={complaintType}>
                    {complaintType}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="portal-form__field">
            <span>How can we help?</span>
            <textarea
              name="howCanWeHelp"
              rows="3"
              value={formData.howCanWeHelp}
              onChange={handleChange}
              required
            />
          </label>

          <label className="portal-form__field">
            <span>Full details</span>
            <textarea name="fullDetails" rows="5" value={formData.fullDetails} onChange={handleChange} required />
          </label>

          <label className="portal-form__field">
            <span>Attachment</span>
            <input type="file" onChange={handleAttachmentChange} />
            {attachmentName ? <small className="portal-form__hint">{attachmentName}</small> : null}
          </label>

          <div className="portal-form__actions">
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Help Ticket'}
            </button>
          </div>
        </form>
      </section>

      <section className="portal-form-card portal-form-card--wide">
        <form className="portal-form" onSubmit={handleTicketLookup}>
          <p className="portal-form__eyebrow">Track Support Reply</p>
          <h2>Check your help ticket</h2>
          <div className="portal-form__split">
            <label className="portal-form__field"><span>Ticket ID</span><input value={lookup.ticketId} onChange={(event) => setLookup((current) => ({ ...current, ticketId: event.target.value }))} required /></label>
            <label className="portal-form__field"><span>Email used in ticket</span><input type="email" value={lookup.email} onChange={(event) => setLookup((current) => ({ ...current, email: event.target.value }))} required /></label>
          </div>
          <div className="portal-form__actions"><button type="submit" className="login-submit">Check Reply</button></div>
          {ticketStatus && <div className="dashboard-page__status dashboard-page__status--success"><strong>{ticketStatus.ticketId} · {ticketStatus.status}</strong><p>{ticketStatus.reply || 'The support team has not replied yet.'}</p></div>}
        </form>
      </section>
    </div>
  );
}

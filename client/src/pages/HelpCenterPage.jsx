import { useState } from 'react';
import { fetchSupportTicketStatus, submitStudentSupportTicket } from '../services/api';

const contactItems = [
  {
    title: 'Contact Email',
    value: 'helpclassgain@gmail.com',
    note: 'Send your questions any time and our classGain team will reply.'
  },
  {
    title: 'Contact Number', 
    value: '+91 9786441032',
    note: 'Talk with our support team during working hours for quick help.'
  },
  {
    title: 'Support Hours',
    value: ' every day 24 hours',
    note: 'Easy support timing for students, parents, and education centers.'
  }
];
 
export default function HelpCenterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    question: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [lookup, setLookup] = useState({ ticketId: '', email: '' });
  const [ticketStatus, setTicketStatus] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setStatus({ type: '', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await submitStudentSupportTicket({ studentName: formData.name, email: formData.email, subject: formData.subject, message: formData.question });
      setLookup({ ticketId: response.ticket?.ticketId || '', email: formData.email });
      setTicketStatus(response.ticket || null);
      setFormData({ name: '', email: '', subject: '', question: '' });
      setStatus({ type: 'success', message: response.message });
    } catch (error) { setStatus({ type: 'error', message: error.message }); }
  }

  async function handleTicketLookup(event) {
    event.preventDefault();
    try {
      const response = await fetchSupportTicketStatus('student', lookup.ticketId, lookup.email);
      setTicketStatus(response.ticket);
      setStatus({ type: '', message: '' });
    } catch (error) {
      setTicketStatus(null);
      setStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="help-center-page">
 <div className="help-team-visual">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80"
                alt="class-Gain support team"
                className="help-team-visual__image"
              />
            </div>

      <section className="help-center-main">
        <div className="container-xl">
          <div className="help-center-stack">
            <div className="help-center-form-card help-center-form-card--full">
              <span className="help-center-panel__eyebrow">Contact Form</span>
              <h2>Send your question to the classGain team</h2>
              <p className="help-center-form-card__text">
                Write your message here first. Our support team will review your question and contact you with the next
                help step.
              </p>

              <form className="help-center-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="question"
                  placeholder="Write your question"
                  rows="6"
                  value={formData.question}
                  onChange={handleChange}
                  required
                />
                <button type="submit" className="help-center-form__button">
                  Submit Question
                </button>
              </form>

              {status.message && <div className={status.type === 'success' ? 'help-center-success' : 'alert alert-danger mt-3'}>{status.message}</div>}
            </div>

            <div className="help-center-form-card help-center-form-card--full">
              <span className="help-center-panel__eyebrow">Track Support Reply</span>
              <h2>Check your support ticket</h2>
              <form className="help-center-form" onSubmit={handleTicketLookup}>
                <input value={lookup.ticketId} onChange={(event) => setLookup((current) => ({ ...current, ticketId: event.target.value }))} placeholder="Ticket ID" required />
                <input type="email" value={lookup.email} onChange={(event) => setLookup((current) => ({ ...current, email: event.target.value }))} placeholder="Email used in the ticket" required />
                <button type="submit" className="help-center-form__button">Check Reply</button>
              </form>
              {ticketStatus && <div className="help-center-success"><strong>{ticketStatus.ticketId} · {ticketStatus.status}</strong><p>{ticketStatus.reply || 'The support team has not replied yet.'}</p></div>}
            </div>

           
            <div className="help-center-panel help-center-panel--wide">
              <span className="help-center-panel__eyebrow">Support Team</span>
              <h2>How the classGain team helps you</h2>
              <p>
                Our team helps students, parents, and education centers understand admissions, login problems, learning
                pages, purchase options, and registration support in one place.
              </p>
              <p>
                After you send the form, the team checks your message, explains the correct page or process, and guides
                you with easy next steps.
              </p>
            </div>

            <div className="help-center-contact-grid help-center-contact-grid--wide">
              {contactItems.map((item) => (
                <article key={item.title} className="help-contact-card">
                  <p className="help-contact-card__label">{item.title}</p>
                  <h3>{item.value}</h3>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

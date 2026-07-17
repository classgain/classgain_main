import { useState } from 'react';
import { submitStudentSupportTicket } from '../services/api';

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

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setStatus({ type: '', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await submitStudentSupportTicket({ studentName: formData.name, email: formData.email, subject: formData.subject, message: formData.question });
      setFormData({ name: '', email: '', subject: '', question: '' });
      setStatus({ type: 'success', message: response.message });
    } catch (error) { setStatus({ type: 'error', message: error.message }); }
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

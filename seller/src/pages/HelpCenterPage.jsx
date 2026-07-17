import { useState } from 'react';

const contactItems = [
  {
    title: 'Contact Email',
    value: 'helpclassgain@gmail.com',
    note: 'Send your questions any time and our classgain team will reply.'
  },
  {
    title: 'Contact Number',
    value: '+91 9786441032',
    note: 'Talk with our support team during working hours for quick help.'
  },
  {
    title: 'Support Hours',
    value: '24 hour support',
    note: 'Easy support timing for students, parents, and education centers.'
  }
];

export default function HelpCenterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="help-center-page">
 <div className="help-team-visual">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80"
                alt="classgain support team"
                className="help-team-visual__image"
              />
            </div>

      <section className="help-center-main">
        <div className="container-xl">
          <div className="help-center-stack">
            <div className="help-center-form-card help-center-form-card--full">
              <span className="help-center-panel__eyebrow">Contact Form</span>
              <h2>Send your question to the classgain team</h2>
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

              {submitted && (
                <div className="help-center-success">
                  Your question has been submitted. The classgain team will contact you soon.
                </div>
              )}
            </div>

           
            <div className="help-center-panel help-center-panel--wide">
              <span className="help-center-panel__eyebrow">Support Team</span>
              <h2>How the classgain team helps you</h2>
              <p>
                Our team helps students, parents, and education centers understand admissions, login problems, learning
                pages, videos, and registration support in one place.
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

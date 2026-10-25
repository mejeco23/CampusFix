import { useState } from 'react'
import BrandLogo from './BrandLogo.jsx'

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 800)
  }

  return (
    <div className="public-contact-page">
      <header>
        <a href="/" aria-label="CampusFix home">
          <BrandLogo className="contact-brand-logo" />
        </a>
        <nav className="navbar-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/#how-it-works">How it Works?</a>
          <a href="/#about-us">About Us</a>
          <a href="/#reviews">Reviews</a>
          <a href="/contact" className="active">Contact Us</a>
        </nav>
      </header>

      <main className="public-contact-main">
        <section className="contact-intro" aria-labelledby="contact-heading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h1 id="contact-heading">Get in Touch</h1>
          <p>Have questions about maintenance requests or technical feedback? Send us a message and our support team will respond shortly.</p>

          <div className="contact-details">
            <a href="mailto:support@campusfix.test">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <span>support@campusfix.test</span>
            </a>
            <a href="tel:+63281234567">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>(02) 8123-4567</span>
            </a>
          </div>
        </section>

        <section className="contact-card" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading">Contact Us</h2>

          {submitted ? (
            <div className="contact-success" role="status">
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We will get back to you as soon as possible.</p>
              <button type="button" onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <label className="visually-hidden" htmlFor="contact-name">Full name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Full Name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />

              <label className="visually-hidden" htmlFor="contact-email">Email address</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Email Address"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />

              <label className="visually-hidden" htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                required
              />

              <label className="visually-hidden" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows="4"
                placeholder="Write your message here..."
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                required
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}

          <p className="contact-back-link">Back to <a href="/">Home</a></p>
        </section>
      </main>
    </div>
  )
}

export default ContactUs

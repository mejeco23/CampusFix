import { useState } from 'react'

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission handling
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 800)
  }

  return (
    <div className="public-contact-page" style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg style={{ width: '28px', height: '28px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#2d3748' }}>CampusFix</span>
        </a>

        <nav className="navbar-links" style={{ gap: '32px' }}>
          <a href="/">Home</a>
          <a href="/#how-it-works">How it Works?</a>
          <a href="/#about-us">About Us</a>
          <a href="/#reviews">Reviews</a>
          <a href="/contact" className="active">Contact Us</a>
        </nav>
      </header>

      {/* Main Split Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '80px',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>

        {/* Left Side Branding & Info */}
        <div style={{ textAlign: 'left', maxWidth: '380px' }}>
          <svg style={{ width: '64px', height: '64px', color: '#2d3748', marginBottom: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2d3748', margin: '0 0 8px 0' }}>Get in Touch</h1>
          <p style={{ color: '#718096', fontSize: '15px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            Have questions about maintenance requests or technical feedback? Send us a message and our support team will respond shortly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4a5568' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>
              <span>support@campusfix.test</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>(02) 8123-4567</span>
            </div>
          </div>
        </div>

        {/* Right Side Contact Form Card */}
        <div style={{
          backgroundColor: '#faf9f5',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #eae6df'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#2d3748', margin: '0 0 24px 0' }}>Contact Us</h2>

          {submitted ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', color: '#22543d' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Message Sent!</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Thank you for reaching out. We will get back to you as soon as possible.</p>
              <button
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#3b4a5a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Full Name */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2d3748',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: '#2d3748',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Email Address */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2d3748',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: '#2d3748',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Subject */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2d3748',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: '#2d3748',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2d3748',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    color: '#2d3748',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#3b4a5a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#4a5568' }}>
            Back to{' '}
            <a href="/" style={{ color: '#2d3748', textDecoration: 'underline', fontWeight: '600' }}>
              Home
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default ContactUs
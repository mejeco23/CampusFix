import { useState } from 'react'
import api from './api.js'
import AuthCard from './AuthCard.jsx'
import BrandLogo from './BrandLogo.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get('email') || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notVerified, setNotVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleResendVerification() {
    setIsResending(true)
    setError('')
    try {
      const { data } = await api.post('/email/resend', { email })
      setMessage(data.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send the verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setNotVerified(false)
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/forgot-password', { email })
      setMessage(data.message)
    } catch (requestError) {
      if (requestError.response?.data?.code === 'email_not_verified') {
        setNotVerified(true)
        setError(requestError.response.data.message)
        return
      }
      const errors = requestError.response?.data?.errors
      setError(errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || 'Could not send the reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="landing-container">
      <span className="hero-decor hero-decor--top-right" aria-hidden="true" />
      <span className="hero-decor hero-decor--bottom-left" aria-hidden="true" />
      <span className="hero-decor hero-decor--bottom-left-line" aria-hidden="true" />
      <span className="hero-decor hero-decor--bottom-right" aria-hidden="true" />

      <header className="landing-navbar">
        <div className="navbar-brand">
          <a href="/" aria-label="CampusFix home">
            <BrandLogo className="landing-brand-logo" />
          </a>
        </div>
        <nav className="navbar-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/#how-it-works">How it Works?</a>
          <a href="/#about-us">About Us</a>
          <a href="/#reviews">Reviews</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-left">
          <span className="hero-badge">Campus Maintenance Portal</span>
          <h1 className="hero-headline">
            Get back to keeping <span>campus safe.</span>
          </h1>
          <p className="hero-subtext">
            Forgot your password? Enter the email address linked to your account and we’ll send you a secure reset link.
          </p>
          <div className="hero-features">
            <div className="feature-item"><span className="feature-check">✓</span> Secure password reset</div>
            <div className="feature-item"><span className="feature-check">✓</span> Link sent to your email</div>
            <div className="feature-item"><span className="feature-check">✓</span> Get back to CampusFix</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="auth-card-wrapper">
            <AuthCard title="Forgot password?">
              <form className="auth-form" onSubmit={handleSubmit}>
                <p className="auth-switch">Enter your account email and we’ll send you a link to reset your password.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                {notVerified && (
                  <button className="primary-button" type="button" onClick={handleResendVerification} disabled={isResending}>
                    {isResending ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
                {message && <p className="profile-success forgot-password-success" role="status">{message}</p>}
                <label className="input-row">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
                  <span className="visually-hidden">Email address</span>
                  <input type="email" name="email" autoComplete="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
                </label>
                <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send reset link'}</button>
              </form>
              <p className="auth-switch">Back to <a href="/login">Login</a></p>
            </AuthCard>
          </div>
        </div>
      </section>
    </div>
  )
}

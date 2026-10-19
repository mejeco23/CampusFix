import { useState } from 'react'
import useAuth from './useAuth.js'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Unable to create your account. Please try again.'
}

function Register({ embedded = false, onSwitchToLogin }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student' })
  const [error, setError] = useState('')
  const [registrationResult, setRegistrationResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setRegistrationResult(null)
    setIsSubmitting(true)
    try {
      setRegistrationResult(await register(form))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={embedded ? { fontFamily: 'sans-serif' } : { minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {!embedded && <header style={{
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
          <a href="/#how-it-works">How it Works?</a>
          <a href="/#about-us">About Us</a>
          <a href="/#reviews">Reviews</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </header>}

      {/* Main Split Content Area */}
      <main style={embedded ? { width: '100%' } : {
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

        {!embedded && <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <svg style={{ width: '64px', height: '64px', color: '#2d3748', marginBottom: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2d3748', margin: '0 0 8px 0' }}>CampusFix</h1>
          <p style={{ color: '#718096', fontSize: '15px', margin: 0, fontWeight: '500' }}>
            Report • Track • Keep Campus Safe
          </p>
        </div>}

        {/* Right Side Register Card */}
        <div style={{
          backgroundColor: '#faf9f5',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #eae6df'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#2d3748', margin: '0 0 28px 0' }}>
            {registrationResult ? 'Account created' : 'Create account'}
          </h2>

          {registrationResult ? (
            <div className={`registration-result registration-result--${registrationResult.verification_email_status}`} role="status">
              <p>{registrationResult.message}</p>
              <strong>{form.email}</strong>
            </div>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fff5f5', color: '#e53e3e', fontSize: '13px', border: '1px solid #fed7d7' }} role="alert">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', position: 'absolute', left: '12px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
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
              <svg style={{ width: '20px', height: '20px', position: 'absolute', left: '12px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '8px',
                  border: '1.5px solid #2d3748',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#2d3748',
                  outline: 'none'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', position: 'absolute', left: '12px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="10" width="14" height="11" rx="1" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '8px',
                  border: '1.5px solid #2d3748',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#2d3748',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2d3748' }}
              >
                <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            {/* Confirm Password */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', position: 'absolute', left: '12px', color: '#2d3748' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="10" width="14" height="11" rx="1" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="password_confirmation"
                placeholder="Confirm Password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                minLength={8}
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '8px',
                  border: '1.5px solid #2d3748',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#2d3748',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2d3748' }}
              >
                <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '10px',
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
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </form>
          )}

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#4a5568' }}>
            {registrationResult ? 'Continue to ' : 'Already have an account? '}
            {onSwitchToLogin ? (
              <button type="button" onClick={onSwitchToLogin} style={{ color: '#2d3748', textDecoration: 'underline', fontWeight: '600', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
                Login
              </button>
            ) : (
              <a href="/login" style={{ color: '#2d3748', textDecoration: 'underline', fontWeight: '600' }}>
                Login
              </a>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register
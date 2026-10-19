import { useState } from 'react'
import useAuth from './useAuth.js'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Unable to sign in. Check your details and try again.'
}

function Login({ embedded = false, onSwitchToRegister }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(form)
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

      {/* Main Content Area */}
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

        {/* Right Side Login Card */}
        <div style={{
          backgroundColor: '#faf9f5',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #eae6df'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#2d3748', margin: '0 0 28px 0' }}>Welcome back</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fff5f5', color: '#e53e3e', fontSize: '13px', border: '1px solid #fed7d7' }} role="alert">
                {error}
              </div>
            )}

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
                autoFocus
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
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* Options */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4a5568', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                Remember me
              </label>
              <a href="mailto:support@campusfix.test?subject=Password%20reset" style={{ color: '#4a5568', textDecoration: 'underline' }}>
                Forgot password?
              </a>
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
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#4a5568' }}>
            Don't have an account?{' '}
            {onSwitchToRegister ? (
              <button type="button" onClick={onSwitchToRegister} style={{ color: '#2d3748', textDecoration: 'underline', fontWeight: '600', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
                Register
              </button>
            ) : (
              <a href="/register" style={{ color: '#2d3748', textDecoration: 'underline', fontWeight: '600' }}>
                Register
              </a>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
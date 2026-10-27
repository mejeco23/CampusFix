import { useEffect, useState } from 'react'
import api from './api.js'
import AuthCard from './AuthCard.jsx'
import useAuth from './useAuth.js'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors
    ? Object.values(errors).flat()[0]
    : error.response?.data?.message || 'Unable to sign in. Check your details and try again.'
}

function Login({ embedded = false, onSwitchToRegister }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const verificationStatus = params.get('verified')

    if (verificationStatus === '1') {
      setNotice('Your email has been verified successfully. You can now sign in.')
    } else if (verificationStatus === 'invalid') {
      setError('This verification link is invalid or has expired. Please request a new verification email.')
    }
  }, [])

  async function handleResendVerification() {
    const emailToResend = (form.email || '').trim()
    if (!emailToResend) {
      setResendMessage('Enter your email address to resend the verification email.')
      return
    }

    setResendMessage('')
    setIsResending(true)

    try {
      const { data } = await api.post('/email/resend', { email: emailToResend })
      setResendMessage(data.message || 'If that account needs verification, a new link has been sent.')
    } catch (requestError) {
      setResendMessage(requestError.response?.data?.message || 'We could not send the verification email right now. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setResendMessage('')
    setShowResendVerification(false)
    setIsSubmitting(true)

    try {
      await login(form)
    } catch (requestError) {
      const code = requestError.response?.data?.code
      setError(errorMessage(requestError))

      if (code === 'email_not_verified') {
        setShowResendVerification(true)
        setNotice('Your email is not verified yet. Please check your inbox and spam folder for the verification link.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={embedded ? 'auth-embedded' : 'auth-screen'}>
      <AuthCard title="Welcome back">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}

          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <span className="visually-hidden">Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="1" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
            </svg>
            <span className="visually-hidden">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          <div className="auth-options">
            <label className="remember-option">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={(event) => setForm({ ...form, remember: event.target.checked })}
              />
              Remember me
            </label>
            <a className="subtle-link" href="/forgot-password">
              Forgot password?
            </a>
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>

          {showResendVerification && (
            <div className="registration-result" role="status">
              <p>Need a fresh verification email? We can send another one to your address.</p>
              <button
                type="button"
                className="primary-button"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? 'Sending…' : 'Resend Verification Email'}
              </button>
              {resendMessage && <p>{resendMessage}</p>}
            </div>
          )}
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          {onSwitchToRegister ? (
            <button className="text-button" type="button" onClick={onSwitchToRegister}>
              Register
            </button>
          ) : (
            <a href="/register">Register</a>
          )}
        </p>
      </AuthCard>
    </main>
  )
}

export default Login

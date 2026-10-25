import { useState } from 'react'
import api from './api.js'
import AuthCard from './AuthCard.jsx'

export default function ForgotPassword({ embedded = false }) {
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
    <main className={embedded ? 'auth-embedded' : 'auth-screen'}>
      <AuthCard title="Forgot password?">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="auth-switch">Enter your email and we'll send you a link to reset your password.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          {notVerified && (
            <button className="primary-button" type="button" onClick={handleResendVerification} disabled={isResending}>
              {isResending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
          {message && <p className="profile-success" role="status">{message}</p>}
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
            <span className="visually-hidden">Email address</span>
            <input type="email" name="email" autoComplete="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="auth-switch"><a href="/login">Back to login</a></p>
      </AuthCard>
    </main>
  )
}

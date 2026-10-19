import { useState } from 'react'
import useAuth from './useAuth.js'
import api from './api.js'
import AuthCard from './AuthCard.jsx'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Unable to sign in. Check your details and try again.'
}

function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationNeeded, setVerificationNeeded] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const verified = new URLSearchParams(window.location.search).get('verified')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setVerificationNeeded(false)
    setVerificationMessage('')
    setIsSubmitting(true)
    try {
      await login(form)
    } catch (requestError) {
      setError(errorMessage(requestError))
      setVerificationNeeded(requestError.response?.data?.code === 'email_not_verified')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function resendVerification() {
    setIsResending(true)
    setVerificationMessage('')
    try {
      const { data } = await api.post('/email/resend', { email: form.email })
      setVerificationMessage(data.message)
    } catch (requestError) {
      setVerificationMessage(requestError.response?.data?.message || 'Could not resend the verification email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="auth-screen">
      <AuthCard title="Welcome back">
        <form className="auth-form" onSubmit={handleSubmit}>
          {verified === '1' && <p className="profile-success" role="status">Email verified! You can now log in.</p>}
          {verified === 'invalid' && <p className="form-error" role="alert">That verification link is invalid or has expired.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {verificationNeeded && <button className="text-button" type="button" onClick={resendVerification} disabled={isResending}>{isResending ? 'Sending…' : 'Resend verification email'}</button>}
          {verificationMessage && <p className="profile-success" role="status">{verificationMessage}</p>}
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
            <span className="visually-hidden">Email address</span>
            <input type="email" name="email" autoComplete="email" placeholder="Email Address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoFocus />
          </label>
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg>
            <span className="visually-hidden">Password</span>
            <input type="password" name="password" autoComplete="current-password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <div className="auth-options">
            <label className="remember-option"><input type="checkbox" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} /><span>Remember me</span></label>
            <a className="subtle-link" href="/forgot-password">Forgot password?</a>
          </div>
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Login'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <a href="/register">Register</a></p>
      </AuthCard>
    </main>
  )
}

export default Login
import { useState } from 'react'
import api from './api.js'
import AuthCard from './AuthCard.jsx'

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const email = params.get('email')
  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/reset-password', { token, email, ...form })
      setMessage(data.message)
      localStorage.removeItem('campusfix_token')
      sessionStorage.removeItem('campusfix_token')
      localStorage.removeItem('campusfix_user')
      setTimeout(() => { window.location.href = '/login' }, 1500)
    } catch (requestError) {
      const errors = requestError.response?.data?.errors
      setError(errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || 'Could not reset your password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <main className="auth-screen">
        <AuthCard title="Reset password">
          <p className="form-error" role="alert">This reset link is invalid.</p>
          <p className="auth-switch"><a href="/forgot-password">Request a new link</a></p>
        </AuthCard>
      </main>
    )
  }

  return (
    <main className="auth-screen">
      <AuthCard title="Reset password">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="profile-success" role="status">{message}</p>}
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg>
            <span className="visually-hidden">New password</span>
            <input type="password" autoComplete="new-password" placeholder="New Password (min 8)" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoFocus />
          </label>
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg>
            <span className="visually-hidden">Confirm new password</span>
            <input type="password" autoComplete="new-password" placeholder="Confirm New Password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} required />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Reset password'}</button>
        </form>
        <p className="auth-switch"><a href="/login">Back to login</a></p>
      </AuthCard>
    </main>
  )
}

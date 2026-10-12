import { useState } from 'react'
import useAuth from './useAuth.js'
import AuthCard from './AuthCard.jsx'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Unable to create your account. Please try again.'
}

function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register(form)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen">
      <AuthCard title="Create your account">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            <span className="visually-hidden">Full name</span>
            <input type="text" name="name" autoComplete="name" placeholder="Full Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus />
          </label>
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
            <span className="visually-hidden">Email address</span>
            <input type="email" name="email" autoComplete="email" placeholder="Email Address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg>
            <span className="visually-hidden">Password</span>
            <input type="password" name="password" autoComplete="new-password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} required />
          </label>
          <label className="input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg>
            <span className="visually-hidden">Confirm password</span>
            <input type="password" name="password_confirmation" autoComplete="new-password" placeholder="Confirm Password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} minLength={8} required />
          </label>
          <label className="input-row input-row--select">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" /><circle cx="18" cy="17" r="2" /></svg>
            <span className="visually-hidden">Account type</span>
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="student">Student</option>
              <option value="maintenance">Maintenance staff</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Register'}</button>
        </form>
        <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
      </AuthCard>
    </main>
  )
}

export default Register
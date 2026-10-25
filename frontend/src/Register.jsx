import { useState } from 'react'
import AuthCard from './AuthCard.jsx'
import useAuth from './useAuth.js'

function errorMessage(error) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Unable to create your account. Please try again.'
}

function PasswordInput({ name, placeholder, value, visible, onChange, onToggle }) {
  return (
    <div className="input-row">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="11" rx="1" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </svg>
      <label className="visually-hidden" htmlFor={name}>{placeholder}</label>
      <input
        id={name}
        type={visible ? 'text' : 'password'}
        name={name}
        autoComplete="new-password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        minLength={8}
        required
      />
      <button
        className="password-toggle"
        type="button"
        onClick={onToggle}
        aria-label={`${visible ? 'Hide' : 'Show'} ${placeholder.toLowerCase()}`}
        aria-pressed={visible}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  )
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
    <main className={embedded ? 'auth-embedded' : 'auth-screen'}>
      <AuthCard title={registrationResult ? 'Account created' : 'Create account'}>
        {registrationResult ? (
          <div className={`registration-result registration-result--${registrationResult.verification_email_status}`} role="status">
            <p>{registrationResult.message}</p>
            <strong>{form.email}</strong>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p className="form-error" role="alert">{error}</p>}

            <label className="input-row">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <span className="visually-hidden">Full name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Full Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>

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

            <PasswordInput
              name="password"
              placeholder="Password"
              value={form.password}
              visible={showPassword}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              onToggle={() => setShowPassword(!showPassword)}
            />

            <PasswordInput
              name="password_confirmation"
              placeholder="Confirm Password"
              value={form.password_confirmation}
              visible={showConfirmPassword}
              onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {registrationResult ? 'Continue to ' : 'Already have an account? '}
          {onSwitchToLogin ? (
            <button className="text-button" type="button" onClick={onSwitchToLogin}>
              Login
            </button>
          ) : (
            <a href="/login">Login</a>
          )}
        </p>
      </AuthCard>
    </main>
  )
}

export default Register

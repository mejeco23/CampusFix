
import { useState } from 'react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      await login(form)
    } catch (requestError) {
      const code = requestError.response?.data?.code
      setError(errorMessage(requestError))

      if (code === 'email_not_verified') {
        setNotice('Your email is not verified yet. Please contact support to request a new verification link.')
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

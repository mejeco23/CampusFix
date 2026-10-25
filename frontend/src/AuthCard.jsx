import BrandLogo from './BrandLogo.jsx'

function AuthCard({ title, subtitle = 'Report · Track · Keep Campus Safe', children }) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <header className="auth-brand">
        <a className="auth-brand-logo-link" href="/" aria-label="CampusFix home">
          <BrandLogo className="auth-brand-logo" />
        </a>
        <p className="brand-tagline">{subtitle}</p>
      </header>
      <h1 className="auth-title" id="auth-title">{title}</h1>
      {children}
    </section>
  )
}

export default AuthCard

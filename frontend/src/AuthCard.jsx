function AuthCard({ title, subtitle = 'Report · Track · Keep Campus Safe', children }) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <header className="auth-brand">
        <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
          <path d="m29.7 5.6 2.7 2.7-4.1 4.1 3.2 3.2 4.1-4.1 2.7 2.7-3.8 3.8-6.5-6.5 1.7-5.9ZM7.3 34.1l16.4-16.4 6.6 6.6L13.9 40.7l-6.6-6.6Zm4.4 4.4-2.4 2.4 1.8 1.8 2.4-2.4-1.8-1.8Zm20.1-17.8 3.4-3.4 6.6 6.6-3.4 3.4-6.6-6.6Zm-5.9-5.9 3.4-3.4 6.6 6.6-3.4 3.4-6.6-6.6ZM7.3 12.3l2.7-2.7 4.1 4.1 3.2-3.2-4.1-4.1 2.7-2.7 3.8 3.8-6.5 6.5-5.9-1.7Zm17.8 20.1 3.4 3.4-6.6 6.6-3.4-3.4 6.6-6.6Zm5.9-5.9 3.4 3.4-6.6 6.6-3.4-3.4 6.6-6.6Z" />
        </svg>
        <a className="brand-name" href="/" aria-label="CampusFix home">CampusFix</a>
        <p className="brand-tagline">{subtitle}</p>
      </header>
      <h1 className="auth-title" id="auth-title">{title}</h1>
      {children}
    </section>
  )
}

export default AuthCard
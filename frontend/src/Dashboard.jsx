import { useEffect, useState } from 'react'
import api from './api.js'

const statsConfig = [
  { key: 'total', label: 'Total requests', kind: 'total' },
  { key: 'pending', label: 'Pending', kind: 'pending' },
  { key: 'in_progress', label: 'In progress', kind: 'progress' },
  { key: 'completed', label: 'Completed', kind: 'completed' },
]

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></>,
    create: <><path d="M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" /><path d="m16 3 5 5-9 9-4 1 1-4 9-9Z" /></>,
    list: <><path d="M7 3h10l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M17 3v5h5M9 12h8M9 16h8M3 7v14" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></>,
    total: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M15 3v5h5M8 12h8M8 16h8" /></>,
    pending: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    progress: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l4 2" /><path d="M16 3v5h5" /></>,
    completed: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 6-7" /></>,
  }

  return <svg className={`icon icon--${name}`} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

export function Sidebar({ user, logout, active }) {
  return (
    <aside className="workspace-sidebar">
      <a className="workspace-brand" href="/dashboard"><span className="brand-tool">✣</span><span>CampusFix</span></a>
      <nav className="workspace-nav" aria-label="Main navigation">
        <a className={active === 'home' ? 'active' : ''} href="/dashboard"><Icon name="home" /><span>Home</span></a>
        <a className={active === 'create' ? 'active' : ''} href="/create-request"><Icon name="create" /><span>Create Request</span></a>
        <a className={active === 'requests' ? 'active' : ''} href="/requests"><Icon name="list" /><span>My Requests</span></a>
      </nav>
      <div className="workspace-sidebar-bottom">
        <a className="workspace-profile" href="/profile" aria-label="Edit profile">
          {user.profile_photo_url ? <img className="profile-avatar" src={user.profile_photo_url} alt={user.name} /> : <span className="profile-avatar">{user.name.charAt(0).toUpperCase()}</span>}
          <span><strong>{user.name}</strong><small>{user.email}</small></span>
        </a>
        <button className="workspace-nav-logout" type="button" onClick={logout}><Icon name="logout" /><span>Logout</span></button>
      </div>
    </aside>
  )
}

function statusLabel(status) {
  return (status || 'pending').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function dateLabel(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })
}

function Dashboard({ user, logout }) {
  const [data, setData] = useState({ stats: {}, requests: [] })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/dashboard')
      .then(({ data: response }) => {
        if (active) setData(response)
      })
      .catch(() => {
        if (active) setError('We could not load your requests. Please refresh to try again.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [])

  const firstName = user.name.trim().split(/\s+/)[0]

  return (
    <div className="workspace-shell">
      <Sidebar user={user} logout={logout} active="home" />
      <main className="workspace-main">
        <header className="mobile-workspace-brand"><a className="workspace-brand" href="/dashboard"><span className="brand-tool">✣</span><span>CampusFix</span></a></header>
        <div className="workspace-content">
          <div className="workspace-page-heading">
            <div><p className="workspace-eyebrow">CAMPUS MAINTENANCE</p><h1>Welcome, {firstName}!</h1><p className="workspace-subtitle">Here's an overview of your maintenance requests.</p></div>
            <a className="workspace-primary-action" href="/create-request"><span aria-hidden="true">＋</span> Create request</a>
          </div>

          {error && <p className="workspace-error" role="alert">{error}</p>}

          <section className="workspace-stats" aria-label="Request summary">
            {statsConfig.map((item) => (
              <article className={`workspace-stat workspace-stat--${item.kind}`} key={item.key}>
                <span className="workspace-stat-icon"><Icon name={item.kind} /></span>
                <span className="workspace-stat-label">{item.label}</span>
                <strong>{isLoading ? '—' : data.stats[item.key] ?? 0}</strong>
              </article>
            ))}
          </section>

          <section className="workspace-section">
            <div className="workspace-section-heading"><div><p className="workspace-eyebrow">YOUR ACTIVITY</p><h2>Recent requests</h2></div><a className="workspace-text-link" href="/requests">View all <span aria-hidden="true">→</span></a></div>
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {!isLoading && data.requests.length === 0 ? (
                    <tr><td colSpan="5" className="workspace-empty"><span className="empty-symbol">＋</span><strong>No requests yet</strong><span>Create a request when something on campus needs attention.</span><a className="workspace-secondary-action" href="/create-request">Create your first request</a></td></tr>
                  ) : data.requests.map((item) => (
                    <tr key={item.id}><td className="request-id">#{String(item.id).padStart(4, '0')}</td><td className="request-title">{item.title}</td><td>{item.category}</td><td><span className={`request-status request-status--${item.status}`}>{statusLabel(item.status)}</span></td><td>{dateLabel(item.created_at)}</td></tr>
                  ))}
                  {isLoading && <tr><td colSpan="5" className="workspace-table-loading">Loading your requests…</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
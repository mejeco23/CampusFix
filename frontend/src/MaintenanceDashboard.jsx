import { useEffect, useState } from 'react'
import api from './api.js'
import BrandLogo from './BrandLogo.jsx'
import RequestQueueTable from './RequestQueueTable.jsx'

const statCards = [
  { key: 'total', label: 'All requests', hint: 'Across campus' },
  { key: 'pending', label: 'Pending', hint: 'Waiting for review' },
  { key: 'in_progress', label: 'In progress', hint: 'Currently being handled' },
  { key: 'completed', label: 'Completed', hint: 'Resolved requests' },
]

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

function MaintenanceSidebar({ active, setView, logout }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand-wrap">
        <div className="admin-brand">
          <BrandLogo className="admin-brand-logo" />
          <small>Maintenance Operations</small>
        </div>
      </div>
      <nav className="admin-nav" aria-label="Maintenance navigation">
        <button type="button" className={active === 'dashboard' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => setView('dashboard')}>Dashboard</button>
        <button type="button" className={active === 'requests' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => setView('requests')}>Work orders</button>
      </nav>
      <div className="admin-nav-footer">
        <a className="admin-nav-item" href="/profile">Profile</a>
        <button type="button" className="admin-nav-item logout" onClick={logout}>Logout</button>
      </div>
    </aside>
  )
}

function MaintenanceOverview({ user, setView }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/dashboard')
      .then(({ data: response }) => { if (active) setData(response) })
      .catch(() => { if (active) setError('Could not load campus requests. Refresh to try again.') })
    return () => { active = false }
  }, [])

  const firstName = user.name.trim().split(/\s+/)[0]
  const stats = data?.stats || {}

  return (
    <main className="admin-content admin-content--wide">
      <div className="admin-header-row">
        <div><h2>Welcome, {firstName}</h2><p>Maintenance requests across campus that need attention.</p></div>
        <button type="button" className="admin-button admin-button--primary" onClick={() => setView('requests')}>View work orders</button>
      </div>
      {error && <p className="admin-request-error" role="alert">{error}</p>}
      <div className="admin-stat-grid">
        {statCards.map((card) => (
          <article className="admin-stat-card" key={card.key}>
            <span>{card.label}</span><strong>{data ? stats[card.key] : '—'}</strong><small>{card.hint}</small>
          </article>
        ))}
      </div>
      <section className="admin-panel admin-panel--table">
        <div className="admin-panel-heading"><h3>Urgent · high priority</h3><button type="button" className="admin-link-button" onClick={() => setView('requests')}>View all work orders</button></div>
        <div className="admin-table-scroll">
          <table className="admin-table admin-request-table">
            <thead><tr><th>Request</th><th>Student</th><th>Location</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {data?.urgent_requests?.map((request) => (
                <tr key={request.id}>
                  <td><strong>#{request.id} · {request.title}</strong><small className="admin-request-description">{request.category}</small></td>
                  <td>{request.user?.name || 'Student'}</td>
                  <td>{request.building}, {request.room}</td>
                  <td><span className={`request-status request-status--${request.status}`}>{request.status.replaceAll('_', ' ')}</span></td>
                  <td>{dateLabel(request.created_at)}</td>
                </tr>
              ))}
              {data && data.urgent_requests.length === 0 && <tr><td colSpan="5" className="admin-request-empty">No open high-priority requests.</td></tr>}
              {!data && <tr><td colSpan="5" className="admin-request-empty">Loading urgent requests…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default function MaintenanceDashboard({ user, logout }) {
  const [view, setView] = useState(() => {
    return new URLSearchParams(window.location.search).get('view') === 'requests' ? 'requests' : 'dashboard'
  })

  return (
    <div className="admin-shell">
      <MaintenanceSidebar active={view} setView={setView} logout={logout} />
      {view === 'requests' ? (
        <main className="admin-content admin-content--wide">
          <div className="admin-header-row"><div><h2>Work orders</h2><p>Search, filter, and update campus maintenance requests.</p></div></div>
          <RequestQueueTable title="All campus requests" perPage={10} showFilters />
        </main>
      ) : <MaintenanceOverview user={user} setView={setView} />}
    </div>
  )
}

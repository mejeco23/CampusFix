import { useEffect, useState } from 'react'
import api from './api.js'
import BrandLogo from './BrandLogo.jsx'
import RequestQueueTable from './RequestQueueTable.jsx'
import AdminManagement from './AdminManagement.jsx'

function Icon({ name }) {
  const paths = {
    dashboard: <><path d="M4 13.5h7V4H4v9.5Zm9 0h7V10h-7v3.5ZM4 20h7v-6.5H4V20Zm9 0h7v-9.5h-7V20Z" /></>,
    review: <><path d="M5 7.5h14M5 12h10M5 16.5h7" /><path d="m17 14 2 2 4-5" /></>,
    users: <><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 9a5 5 0 0 1 10 0" /><path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm4 9a5 5 0 0 0-4-4.8" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></>,
    add: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="5" /><path d="m16 16 4 4" /></>,
  }

  return <svg className="admin-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function AdminSidebar({ active, setView, user, logout }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'review', label: 'Review & Assign', icon: 'review' },
    { key: 'users', label: 'Users & Facilities', icon: 'users' },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand-wrap">
        <div className="admin-brand">
          <BrandLogo className="admin-brand-logo" />
          <small>Admin / Facility Management</small>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Admin navigation">
        {items.map((item) => (
          <button key={item.key} type="button" className={active === item.key ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => setView(item.key)}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-nav-footer">
        <button type="button" className="admin-nav-item logout" onClick={logout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

function UsersFacilitiesView({ user }) {
  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-header-row">
        <div>
          <h2>Users &amp; Facilities</h2>
          <p>Manage accounts, roles, and the campus locations used in request forms</p>
        </div>
      </div>
      <AdminManagement view="users" currentUserId={user.id} />
      <AdminManagement view="facilities" />
    </div>
  )
}

function ReviewAndAssignView() {
  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-header-row">
        <div>
          <h2>Review &amp; Assign</h2>
          <p>Queue work orders and prioritize campus maintenance requests.</p>
        </div>
      </div>
      <RequestQueueTable role="admin" />
    </div>
  )
}

function DashboardOverviewView() {
  const [period, setPeriod] = useState('semester')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/admin/dashboard', { params: { period } })
      .then(({ data: response }) => { if (active) setData(response) })
      .catch(() => { if (active) setError('Could not load request totals. Refresh to try again.') })
    return () => { active = false }
  }, [period])

  async function exportReport() {
    setError('')
    try {
      const response = await api.get('/admin/requests/export', { params: { period }, responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `campusfix-requests-${period}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Could not export the report. Please try again.')
    }
  }

  const stats = data?.stats || {}
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-header-row">
        <div>
          <h2>Facilities Overview</h2>
          <p>Campus-wide maintenance performance and recurring problems</p>
        </div>
        <div className="admin-header-actions">
          <label className="visually-hidden" htmlFor="admin-report-period">Reporting period</label>
          <select id="admin-report-period" className="admin-button admin-button--secondary" value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="semester">This semester</option>
            <option value="all">All time</option>
          </select>
          <button type="button" className="admin-button admin-button--secondary" onClick={exportReport}>Export report</button>
        </div>
      </div>

      {error && <p className="admin-request-error" role="alert">{error}</p>}
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span>Total requests</span><strong>{data ? stats.total : '—'}</strong><small>Submitted by students</small></article>
        <article className="admin-stat-card"><span>Pending</span><strong>{data ? stats.pending : '—'}</strong><small>Waiting for review</small></article>
        <article className="admin-stat-card"><span>In progress</span><strong>{data ? stats.in_progress : '—'}</strong><small>Being worked on</small></article>
        <article className="admin-stat-card"><span>Completion rate</span><strong>{data ? `${completionRate}%` : '—'}</strong><small>{data ? `${stats.completed} completed` : 'Request status summary'}</small></article>
      </div>

      <div className="admin-graph-grid">
        <section className="admin-panel admin-panel--categories">
          <h3>Requests by category</h3>
          {data?.categories?.length ? (
            <ul className="admin-category-list">
              {data.categories.map(({ category, total }) => (
                <li key={category}>
                  <span>{category}</span>
                  <div className="admin-bar-wrap"><span style={{ width: `${(total / data.stats.total) * 100}%` }} /></div>
                  <strong>{total}</strong>
                </li>
              ))}
            </ul>
          ) : <p className="admin-request-empty">{data ? 'No requests to summarize yet.' : 'Loading category totals…'}</p>}
        </section>
        <section className="admin-panel admin-panel--categories">
          <h3>Request status</h3>
          <ul className="admin-category-list">
            {[
              ['Pending', stats.pending],
              ['In progress', stats.in_progress],
              ['Completed', stats.completed],
            ].map(([label, count]) => (
              <li key={label}><span>{label}</span><div className="admin-bar-wrap"><span style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} /></div><strong>{data ? count : '—'}</strong></li>
            ))}
          </ul>
        </section>
      </div>

      <RequestQueueTable title="Recent student requests" perPage={5} role="admin" />
    </div>
  )
}

export default function AdminDashboard({ user, logout }) {
  const [view, setView] = useState(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view')
    return ['dashboard', 'review', 'users'].includes(requestedView) ? requestedView : 'dashboard'
  })

  return (
    <div className="admin-shell">
      <AdminSidebar active={view} setView={setView} user={user} logout={logout} />
      {view === 'users' ? <UsersFacilitiesView user={user} /> : view === 'review' ? <ReviewAndAssignView /> : <DashboardOverviewView />}
    </div>
  )
}

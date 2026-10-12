import { useEffect, useMemo, useState } from 'react'
import api from './api.js'
import RequestQueueTable from './RequestQueueTable.jsx'

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

const userRows = [
  { name: 'Demo Student', email: 'student@campusfix.test', role: 'Student', status: 'Active' },
  { name: 'Staff A', email: 'staff@campusfix.test', role: 'Maintenance', status: 'Active' },
  { name: 'Admin', email: 'admin@campusfix.test', role: 'Admin', status: 'Active' },
]

const buildings = [
  { name: 'Building A', rooms: '101, 204', action: 'Edit' },
  { name: 'Engineering Bldg', rooms: '105, 204', action: 'Edit' },
  { name: 'Library', rooms: '201', action: 'Edit' },
  { name: 'Main Building', rooms: '302', action: 'Edit' },
]

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
          <span className="admin-brand-mark">✦</span>
          <div>
            <h1>CampusFix</h1>
            <small>Admin / Facility Management</small>
          </div>
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

function UsersFacilitiesView() {
  const [keyword, setKeyword] = useState('')
  const filteredRows = useMemo(() => {
    if (!keyword.trim()) return userRows
    return userRows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(keyword.toLowerCase()))
  }, [keyword])

  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-header-row">
        <div>
          <h2>Users &amp; Facilities</h2>
          <p>Manage accounts, roles, and the campus locations used in request forms</p>
        </div>
      </div>

      <section className="admin-panel admin-panel--table">
        <div className="admin-table-header">
          <div className="admin-search">
            <Icon name="search" />
            <input type="text" aria-label="Search name or email" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search name or email" />
          </div>
          <button type="button" className="admin-button admin-button--primary"><span>＋</span> Add user</button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.email}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>
                  <select defaultValue={row.role.toLowerCase()} className="admin-role-select">
                    <option value="student">Student</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td><span className="admin-status-pill">{row.status}</span></td>
                <td><button type="button" className="admin-link-button">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-panel admin-panel--table admin-panel--locations">
        <div className="admin-panel-heading">
          <h3>Campus locations</h3>
          <div className="admin-segmented-buttons">
            <button type="button" className="admin-segment active">Buildings &amp; rooms</button>
            <button type="button" className="admin-segment">Categories</button>
          </div>
        </div>

        <table className="admin-table admin-table--locations">
          <thead>
            <tr>
              <th>Building</th>
              <th>Rooms</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.rooms}</td>
                <td><button type="button" className="admin-link-button">Edit</button> + <button type="button" className="admin-link-button">Room</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="admin-button admin-button--primary admin-button--add-row"><span>＋</span> Add building</button>
      </section>

      <div className="admin-note">
        Admin-only. Deleting a building or room that has requests should be blocked, because maintenance_requests references rooms.
      </div>
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
      <RequestQueueTable />
    </div>
  )
}

function DashboardOverviewView() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/dashboard')
      .then(({ data: response }) => { if (active) setData(response) })
      .catch(() => { if (active) setError('Could not load request totals. Refresh to try again.') })
    return () => { active = false }
  }, [])

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
          <button type="button" className="admin-button admin-button--secondary">This semester</button>
          <button type="button" className="admin-button admin-button--secondary">Export report</button>
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

      <RequestQueueTable title="Recent student requests" perPage={5} />
    </div>
  )
}

export default function AdminDashboard({ user, logout }) {
  const [view, setView] = useState('dashboard')

  return (
    <div className="admin-shell">
      <AdminSidebar active={view} setView={setView} user={user} logout={logout} />
      {view === 'users' ? <UsersFacilitiesView /> : view === 'review' ? <ReviewAndAssignView /> : <DashboardOverviewView />}
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from './api.js'
import { Sidebar as DashboardSidebar } from './Dashboard.jsx'

function displayStatus(status) {
  return (status || 'pending').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function Requests({ user, logout }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/requests')
      .then(({ data }) => { if (active) setRequests(data.data || []) })
      .catch(() => { if (active) setError('We could not load your requests. Please refresh to try again.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="workspace-shell">
      <DashboardSidebar user={user} logout={logout} active="requests" />
      <main className="workspace-main">
        <header className="mobile-workspace-brand"><a className="workspace-brand" href="/dashboard"><span className="brand-tool">✣</span><span>CampusFix</span></a></header>
        <div className="workspace-content">
          <div className="workspace-page-heading"><div><p className="workspace-eyebrow">TRACK YOUR REPORTS</p><h1>My requests</h1><p className="workspace-subtitle">Updates and status for the issues you've reported.</p></div><a className="workspace-primary-action" href="/create-request"><span aria-hidden="true">＋</span> Create request</a></div>
          {error && <p className="workspace-error" role="alert">{error}</p>}
          <section className="workspace-section workspace-section--flush">
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {!isLoading && requests.length === 0 ? <tr><td colSpan="7" className="workspace-empty"><span className="empty-symbol">＋</span><strong>No requests to show</strong><span>Your submitted maintenance requests will appear here.</span><a className="workspace-secondary-action" href="/create-request">Create a request</a></td></tr> : null}
                  {requests.map((item) => <tr key={item.id}><td className="request-id">#{String(item.id).padStart(4, '0')}</td><td className="request-title">{item.title}</td><td>{item.category}</td><td>{item.building}, {item.room}</td><td><span className={`priority-label priority-label--${item.priority}`}>{item.priority}</span></td><td><span className={`request-status request-status--${item.status}`}>{displayStatus(item.status)}</span></td><td>{new Date(item.created_at).toLocaleDateString()}</td></tr>)}
                  {isLoading && <tr><td colSpan="7" className="workspace-table-loading">Loading your requests…</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Requests
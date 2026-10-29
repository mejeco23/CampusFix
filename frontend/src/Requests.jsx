import { useCallback, useEffect, useState } from 'react'
import api from './api.js'
import BrandLogo from './BrandLogo.jsx'
import { Sidebar as DashboardSidebar } from './Dashboard.jsx'

function displayStatus(status) {
  return (status || 'pending').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function Requests({ user, logout }) {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/requests', { params: { per_page: 100 } })
      const nextRequests = data.data || []
      setRequests(nextRequests)
      setSelectedRequest((current) => nextRequests.find((request) => request.id === current?.id) || null)
      setError('')
    } catch {
      setError('We could not load your requests. Please refresh to try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const refreshRequests = async () => {
    setIsRefreshing(true)
    await fetchRequests()
    setIsRefreshing(false)
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchRequests, 0)
    const interval = window.setInterval(fetchRequests, 30000)
    return () => {
      window.clearTimeout(initialFetch)
      window.clearInterval(interval)
    }
  }, [fetchRequests])

  useEffect(() => {
    if (!selectedRequest) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') setSelectedRequest(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRequest])

  const progressSteps = ['pending', 'in_progress', 'completed']

  return (
    <div className="workspace-shell">
      <DashboardSidebar user={user} logout={logout} active="requests" />
      <main className="workspace-main">
        <header className="mobile-workspace-brand"><a className="workspace-brand" href="/dashboard" aria-label="CampusFix dashboard"><BrandLogo className="workspace-brand-logo" /></a></header>
        <div className="workspace-content">
          <div className="workspace-page-heading">
            <div><p className="workspace-eyebrow">TRACK YOUR REPORTS</p><h1>My requests</h1><p className="workspace-subtitle">Updates and status for the issues you've reported.</p></div>
            <div className="workspace-request-actions">
              <button className="workspace-refresh-action" type="button" onClick={() => refreshRequests()} disabled={isRefreshing}>Refresh status</button>
              <a className="workspace-primary-action" href="/create-request"><span aria-hidden="true">＋</span> Create request</a>
            </div>
          </div>
          {error && <p className="workspace-error" role="alert">{error}</p>}
          <section className="workspace-section workspace-section--flush">
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Priority</th><th>Status</th><th>Date</th><th>Details</th></tr></thead>
                <tbody>
                  {!isLoading && requests.length === 0 ? <tr><td colSpan="8" className="workspace-empty"><span className="empty-symbol">＋</span><strong>No requests to show</strong><span>Your submitted maintenance requests will appear here.</span><a className="workspace-secondary-action" href="/create-request">Create a request</a></td></tr> : null}
                  {requests.map((item) => <tr key={item.id}><td className="request-id">#{String(item.id).padStart(4, '0')}</td><td className="request-title">{item.title}</td><td>{item.category}</td><td>{item.building}, {item.room}</td><td><span className={`priority-label priority-label--${item.priority}`}>{item.priority}</span></td><td><span className={`request-status request-status--${item.status}`}>{displayStatus(item.status)}</span></td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><button className="student-request-details-button" type="button" onClick={() => setSelectedRequest(item)}>View details</button></td></tr>)}
                  {isLoading && <tr><td colSpan="8" className="workspace-table-loading">Loading your requests…</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      {selectedRequest && (
        <div className="request-detail-backdrop" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedRequest(null)
        }}>
          <section className="request-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="student-request-detail-title">
            <div className="request-detail-heading">
              <div>
                <p className="workspace-eyebrow">REQUEST #{String(selectedRequest.id).padStart(4, '0')}</p>
                <h2 id="student-request-detail-title">{selectedRequest.title}</h2>
              </div>
              <button className="request-detail-close" type="button" aria-label="Close request details" autoFocus onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <section className="student-request-progress" aria-label="Request progress">
              <div className="student-request-progress-heading">
                <h3>Progress</h3>
                <span className={`request-status request-status--${selectedRequest.status}`}>{displayStatus(selectedRequest.status)}</span>
              </div>
              {selectedRequest.status === 'rejected' ? (
                <p className="workspace-error" role="status">This request was rejected by an administrator.</p>
              ) : (
                <ol className="student-request-progress-steps">
                  {progressSteps.map((step, index) => {
                    const currentIndex = progressSteps.indexOf(selectedRequest.status)
                    const stepState = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'
                    return <li className={`student-request-progress-step student-request-progress-step--${stepState}`} key={step} aria-current={stepState === 'current' ? 'step' : undefined}><span className="student-request-progress-marker" aria-hidden="true">{stepState === 'complete' ? '✓' : index + 1}</span><span>{displayStatus(step)}</span></li>
                  })}
                </ol>
              )}
              <p className="student-request-updated">Last updated: {formatDate(selectedRequest.updated_at)}</p>
            </section>
            <dl className="request-detail-fields">
              <div><dt>Category</dt><dd>{selectedRequest.category}</dd></div>
              <div><dt>Location</dt><dd>{selectedRequest.building}, Room {selectedRequest.room}</dd></div>
              <div><dt>Priority</dt><dd className={`priority-label priority-label--${selectedRequest.priority}`}>{selectedRequest.priority}</dd></div>
              <div><dt>Submitted</dt><dd>{formatDate(selectedRequest.created_at)}</dd></div>
              <div className="request-detail-description"><dt>Description</dt><dd>{selectedRequest.description}</dd></div>
            </dl>
            {selectedRequest.photo_url && (
              <div className="request-detail-photo">
                <h3>Attached photo</h3>
                <a href={selectedRequest.photo_url} target="_blank" rel="noreferrer">
                  <img src={selectedRequest.photo_url} alt={`Photo attached to ${selectedRequest.title}`} />
                </a>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Requests
import { useEffect, useState } from 'react'
import api from './api.js'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

export default function RequestQueueTable({ title = 'Requests', perPage = 20, showFilters = false, role }) {
  const [requests, setRequests] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    const timer = window.setTimeout(() => {
      const params = { page, per_page: perPage }
      Object.entries(filters).forEach(([key, value]) => {
        if (showFilters && value) params[key] = value
      })

      api.get('/requests', { params })
        .then(({ data }) => {
          if (!active) return
          setRequests(data.data || [])
          setLastPage(data.last_page || 1)
          setError('')
        })
        .catch(() => {
          if (active) setError('Could not load requests. Please refresh to try again.')
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }, showFilters ? 200 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [page, perPage, filters, showFilters])

  async function updateStatus(requestId, status) {
    setUpdatingId(requestId)
    setError('')
    try {
      const { data } = await api.patch(`/requests/${requestId}`, { status })
      setRequests((current) => current.map((item) => item.id === requestId ? data.request : item))
      setSelectedRequest((current) => current?.id === requestId ? data.request : current)
    } catch {
      setError('Could not update the request status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  function statusAction(request) {
    if (role === 'admin' && request.status === 'pending') {
      return { status: 'in_progress', label: 'Verify request' }
    }

    if (role === 'maintenance' && request.status === 'in_progress') {
      return { status: 'completed', label: 'Confirm completed' }
    }

    return null
  }

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  return (
    <section className="admin-panel admin-panel--table">
      <div className="admin-panel-heading"><h3>{title}</h3></div>
      {showFilters && (
        <div className="request-queue-filters">
          <input aria-label="Search request title or ID" type="search" placeholder="Search title or ID" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
          <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilter('priority', event.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}
      {error && <p className="admin-request-error" role="alert">{error}</p>}
      <div className="admin-table-scroll">
        <table className="admin-table admin-request-table">
          <thead><tr><th>Request</th><th>Student</th><th>Category</th><th>Location</th><th>Priority</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {!isLoading && requests.length === 0 && <tr><td colSpan="7" className="admin-request-empty">No requests match your filters.</td></tr>}
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <strong>#{request.id} · {request.title}</strong>
                  <small className="admin-request-description">{request.description}</small>
                  <button className="admin-link-button" type="button" onClick={() => setSelectedRequest(request)}>View details</button>
                </td>
                <td>{request.user?.name || 'Student'}<small className="admin-request-description">{request.user?.email || ''}</small></td>
                <td>{request.category}</td>
                <td>{request.building}, {request.room}</td>
                <td><span className={`priority-label priority-label--${request.priority}`}>{request.priority}</span></td>
                <td>
                  <span className={`request-status request-status--${request.status}`}>
                    {request.status.replaceAll('_', ' ')}
                  </span>
                  {statusAction(request) && (
                    <button
                      type="button"
                      className="admin-link-button"
                      disabled={updatingId === request.id}
                      onClick={() => updateStatus(request.id, statusAction(request).status)}
                    >
                      {updatingId === request.id ? 'Updating…' : statusAction(request).label}
                    </button>
                  )}
                </td>
                <td>{formatDate(request.created_at)}</td>
              </tr>
            ))}
            {isLoading && <tr><td colSpan="7" className="admin-request-empty">Loading requests…</td></tr>}
          </tbody>
        </table>
      </div>
      {lastPage > 1 && (
        <div className="admin-pagination">
          <button className="admin-button admin-button--secondary" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page} of {lastPage}</span>
          <button className="admin-button admin-button--secondary" type="button" disabled={page >= lastPage || isLoading} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      )}
      {selectedRequest && (
        <div
          className="request-detail-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedRequest(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setSelectedRequest(null)
          }}
        >
          <section className="request-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
            <div className="request-detail-heading">
              <div>
                <p className="workspace-eyebrow">REQUEST #{selectedRequest.id}</p>
                <h2 id="request-detail-title">{selectedRequest.title}</h2>
              </div>
              <button className="request-detail-close" type="button" aria-label="Close request details" autoFocus onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <dl className="request-detail-fields">
              <div><dt>Student</dt><dd>{selectedRequest.user?.name || 'Student'}</dd></div>
              {selectedRequest.user?.email && <div><dt>Email</dt><dd><a href={`mailto:${selectedRequest.user.email}`}>{selectedRequest.user.email}</a></dd></div>}
              <div><dt>Category</dt><dd>{selectedRequest.category}</dd></div>
              <div><dt>Location</dt><dd>{selectedRequest.building}, Room {selectedRequest.room}</dd></div>
              <div><dt>Priority</dt><dd className={`priority-label priority-label--${selectedRequest.priority}`}>{selectedRequest.priority}</dd></div>
              <div><dt>Status</dt><dd>{selectedRequest.status.replaceAll('_', ' ')}</dd></div>
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
            <div className="request-detail-actions">
              <button className="admin-button admin-button--primary" type="button" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
import { useEffect, useState } from 'react'
import api from './api.js'
import { Sidebar as DashboardSidebar } from './Dashboard.jsx'

function RequestForm({ user, logout }) {
  const [form, setForm] = useState({ title: '', category: '', building: '', room: '', priority: '', description: '' })
  const [photo, setPhoto] = useState(null)
  const [lookups, setLookups] = useState({ categories: [], buildings: [] })
  const [lookupError, setLookupError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    api.get('/lookups')
      .then(({ data }) => { if (active) setLookups(data) })
      .catch(() => { if (active) setLookupError('Request categories and locations could not be loaded.') })
    return () => { active = false }
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (photo) payload.append('photo', photo)

    try {
      await api.post('/requests', payload)
      window.location.assign('/requests')
    } catch (requestError) {
      const errors = requestError.response?.data?.errors
      setError(errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || 'Could not submit your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBuilding = lookups.buildings.find((building) => building.name === form.building)

  return (
    <div className="workspace-shell">
      <DashboardSidebar user={user} logout={logout} active="create" />
      <main className="workspace-main">
        <header className="mobile-workspace-brand"><a className="workspace-brand" href="/dashboard"><span className="brand-tool">✣</span><span>CampusFix</span></a></header>
        <div className="workspace-content">
          <div className="workspace-page-heading workspace-page-heading--compact"><div><p className="workspace-eyebrow">LET US KNOW WHAT NEEDS FIXING</p><h1>Create maintenance request</h1><p className="workspace-subtitle">Add a few details so the right team can help.</p></div></div>
          {error && <p className="workspace-error" role="alert">{error}</p>}
          {lookupError && <p className="workspace-error" role="alert">{lookupError}</p>}
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="request-form-grid">
              <label className="request-field request-field--wide">Title <span>*</span><input maxLength="150" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Broken air conditioner" required /></label>
              <label className="request-field">Category <span>*</span><select value={form.category} onChange={(event) => update('category', event.target.value)} required><option value="" disabled>Select category</option>{lookups.categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
              <label className="request-field">Priority <span>*</span><select value={form.priority} onChange={(event) => update('priority', event.target.value)} required><option value="" disabled>Select priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
              <label className="request-field">Building <span>*</span><select value={form.building} onChange={(event) => { update('building', event.target.value); update('room', '') }} required><option value="" disabled>Select building</option>{lookups.buildings.map((building) => <option key={building.id} value={building.name}>{building.name}</option>)}</select></label>
              <label className="request-field">Room <span>*</span><select value={form.room} onChange={(event) => update('room', event.target.value)} disabled={!selectedBuilding} required><option value="" disabled>Select room</option>{(selectedBuilding?.rooms || []).map((room) => <option key={room.id} value={room.room_number}>{room.room_number}</option>)}</select></label>
              <label className="request-field request-field--wide">Description <span>*</span><textarea maxLength="5000" rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe the issue and anything else the maintenance team should know." required /></label>
              <label className="request-field request-field--wide">Photo <small>Optional</small><span className="photo-drop"><input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /><strong>{photo?.name || 'Click to upload or drag and drop'}</strong><span>PNG, JPG or WEBP · Maximum 5 MB</span></span></label>
            </div>
            <div className="request-form-actions"><a className="workspace-cancel" href="/dashboard">Cancel</a><button className="workspace-primary-action" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit request →'}</button></div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default RequestForm
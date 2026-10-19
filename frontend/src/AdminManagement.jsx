import { useEffect, useState } from 'react'
import api from './api.js'

function firstError(error, fallback) {
  const errors = error.response?.data?.errors
  return errors ? Object.values(errors).flat()[0] : error.response?.data?.message || fallback
}

function UsersView() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'student', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setIsLoading(true)
      api.get('/admin/users', { params: { search, page, per_page: 20 } })
        .then(({ data }) => {
          if (!active) return
          setUsers(data.data || [])
          setLastPage(data.last_page || 1)
          setError('')
        })
        .catch((requestError) => {
          if (active) setError(firstError(requestError, 'Could not load user accounts.'))
        })
        .finally(() => { if (active) setIsLoading(false) })
    }, 200)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [search, page])

  function startAdd() {
    setEditingUser(null)
    setForm({ name: '', email: '', role: 'student', password: '', password_confirmation: '' })
    setError('')
    setMessage('')
    setFormOpen(true)
  }

  function startEdit(user) {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, role: user.role, password: '', password_confirmation: '' })
    setError('')
    setMessage('')
    setFormOpen(true)
  }

  async function saveUser(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}`, { name: form.name, email: form.email, role: form.role })
        setMessage('Account updated.')
      } else {
        await api.post('/admin/users', form)
        setMessage('Account created. Non-admin users must verify their email before logging in.')
      }
      setFormOpen(false)
      setPage(1)
      const { data } = await api.get('/admin/users', { params: { search, page: 1, per_page: 20 } })
      setUsers(data.data || [])
      setLastPage(data.last_page || 1)
    } catch (requestError) {
      setError(firstError(requestError, 'Could not save this account.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="admin-panel admin-panel--table">
      <div className="admin-table-header">
        <div className="admin-search"><input type="search" aria-label="Search name or email" placeholder="Search name or email" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div>
        <button type="button" className="admin-button admin-button--primary" onClick={startAdd}><span>＋</span> Add user</button>
      </div>
      {error && <p className="admin-request-error" role="alert">{error}</p>}
      {message && <p className="admin-management-message" role="status">{message}</p>}
      {formOpen && (
        <form className="admin-management-form" onSubmit={saveUser}>
          <h3>{editingUser ? 'Edit account' : 'Add user account'}</h3>
          <label>Name<input maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="student">Student</option><option value="maintenance">Maintenance</option><option value="admin">Admin</option></select></label>
          {!editingUser && <>
            <label>Password<input type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
            <label>Confirm password<input type="password" minLength="8" autoComplete="new-password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} required /></label>
          </>}
          <div className="admin-management-actions"><button className="admin-button admin-button--secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editingUser ? 'Save changes' : 'Create account'}</button></div>
        </form>
      )}
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Email status</th><th>Action</th></tr></thead>
          <tbody>
            {!isLoading && users.length === 0 && <tr><td colSpan="5" className="admin-request-empty">No accounts found.</td></tr>}
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td><td>{user.email}</td><td><span className="admin-status-pill">{user.role}</span></td>
                <td>{user.role === 'admin' || user.email_verified_at ? 'Verified' : 'Pending verification'}</td>
                <td><button type="button" className="admin-link-button" onClick={() => startEdit(user)}>Edit</button></td>
              </tr>
            ))}
            {isLoading && <tr><td colSpan="5" className="admin-request-empty">Loading accounts…</td></tr>}
          </tbody>
        </table>
      </div>
      {lastPage > 1 && <div className="admin-pagination"><button className="admin-button admin-button--secondary" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {lastPage}</span><button className="admin-button admin-button--secondary" disabled={page >= lastPage || isLoading} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
    </section>
  )
}

function FacilitiesView() {
  const [data, setData] = useState({ categories: [], buildings: [] })
  const [activeTab, setActiveTab] = useState('buildings')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editor, setEditor] = useState(null)
  const [managingBuildingId, setManagingBuildingId] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const managingBuilding = data.buildings.find((building) => building.id === managingBuildingId)
  const selectedRoom = managingBuilding?.rooms.find((room) => String(room.id) === selectedRoomId)

  async function loadFacilities() {
    setIsLoading(true)
    try {
      const response = await api.get('/admin/facilities')
      setData(response.data)
      setError('')
    } catch (requestError) {
      setError(firstError(requestError, 'Could not load facilities.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFacilities() }, [])

  function openEditor(type, values) {
    setError('')
    setMessage('')
    setEditor({ type, ...values })
  }

  async function saveEditor(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      if (editor.type === 'building') {
        if (editor.id) {
          await api.patch(`/admin/buildings/${editor.id}`, { name: editor.name })
          setMessage('Building updated.')
        } else {
          await api.post('/admin/buildings', {
            name: editor.name,
            rooms: editor.rooms.split(',').map((room) => room.trim()).filter(Boolean),
          })
          setMessage('Building added.')
        }
      } else if (editor.type === 'room') {
        if (editor.id) {
          await api.patch(`/admin/rooms/${editor.id}`, { room_number: editor.room_number })
          setMessage('Room updated.')
        } else {
          await api.post(`/admin/buildings/${editor.buildingId}/rooms`, { room_number: editor.room_number })
          setMessage('Room added.')
        }
      } else {
        if (editor.id) {
          await api.patch(`/admin/categories/${editor.id}`, { name: editor.name })
          setMessage('Category updated.')
        } else {
          await api.post('/admin/categories', { name: editor.name })
          setMessage('Category added.')
        }
      }
      setEditor(null)
      await loadFacilities()
    } catch (requestError) {
      setError(firstError(requestError, `Could not save the ${editor.type}.`))
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteRecord(url, label) {
    if (!window.confirm(`Delete ${label}?`)) return
    setError('')
    setMessage('')
    try {
      await api.delete(url)
      setMessage(`${label} deleted.`)
      await loadFacilities()
    } catch (requestError) {
      setError(firstError(requestError, `Could not delete ${label.toLowerCase()}.`))
    }
  }

  function manageRooms(building) {
    const isAlreadyManaging = managingBuildingId === building.id
    setEditor(null)
    setManagingBuildingId(isAlreadyManaging ? null : building.id)
    setSelectedRoomId('')
  }

  return (
    <section className="admin-panel admin-panel--table admin-panel--locations">
      <div className="admin-panel-heading">
        <h3>Campus locations and categories</h3>
        <div className="admin-segmented-buttons">
          <button type="button" className={activeTab === 'buildings' ? 'admin-segment active' : 'admin-segment'} onClick={() => setActiveTab('buildings')}>Buildings &amp; rooms</button>
          <button type="button" className={activeTab === 'categories' ? 'admin-segment active' : 'admin-segment'} onClick={() => setActiveTab('categories')}>Categories</button>
        </div>
      </div>
      {error && <p className="admin-request-error" role="alert">{error}</p>}
      {message && <p className="admin-management-message" role="status">{message}</p>}
      {activeTab === 'buildings' ? <>
        <div className="admin-table-header"><span>Buildings and their request-form rooms</span><button type="button" className="admin-button admin-button--primary" onClick={() => openEditor('building', { name: '', rooms: '' })}>＋ Add building</button></div>
        {editor && editor.type !== 'category' && <form className="admin-management-form" onSubmit={saveEditor}>
          <h3>{editor.type === 'building' ? `${editor.id ? 'Edit' : 'Add'} building` : `${editor.id ? 'Edit' : 'Add'} room`}</h3>
          {editor.type === 'building' ? <>
            <label>Building name<input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} required /></label>
            {!editor.id && <label>Rooms, separated by commas<input placeholder="101, 204" value={editor.rooms} onChange={(event) => setEditor({ ...editor, rooms: event.target.value })} /></label>}
          </> : <label>Room number<input value={editor.room_number} onChange={(event) => setEditor({ ...editor, room_number: event.target.value })} required /></label>}
          <div className="admin-management-actions"><button className="admin-button admin-button--secondary" type="button" onClick={() => setEditor(null)}>Cancel</button><button className="admin-button admin-button--primary" disabled={isSaving}>{isSaving ? 'Saving…' : editor.id ? 'Save changes' : `Add ${editor.type}`}</button></div>
        </form>}
        {isLoading ? <p className="admin-request-empty">Loading buildings…</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Building</th><th>Rooms</th><th>Actions</th></tr></thead><tbody>
          {data.buildings.map((building) => <tr key={building.id}><td>{building.name}</td><td><div className="admin-room-list">{building.rooms.map((room) => <span key={room.id}>{room.room_number}</span>)}{building.rooms.length === 0 && <span>No rooms</span>}</div></td><td><div className="admin-row-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => openEditor('building', { id: building.id, name: building.name })}>Edit</button><button type="button" className="admin-button admin-button--secondary" aria-expanded={managingBuildingId === building.id} onClick={() => manageRooms(building)}>Manage rooms</button><button type="button" className="admin-link-button" onClick={() => deleteRecord(`/admin/buildings/${building.id}`, building.name)}>Remove</button></div></td></tr>)}
          {data.buildings.length === 0 && <tr><td colSpan="3" className="admin-request-empty">No buildings yet.</td></tr>}
        </tbody></table></div>}
        {managingBuilding && !editor && <div className="admin-room-manager">
          <div><h4>Manage rooms in {managingBuilding.name}</h4><p>Select a room to edit or remove it.</p></div>
          <label>Room<select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)}><option value="">Select a room</option>{managingBuilding.rooms.map((room) => <option key={room.id} value={room.id}>{room.room_number}</option>)}</select></label>
          <div className="admin-row-actions"><button type="button" className="admin-button admin-button--secondary" disabled={!selectedRoom} onClick={() => openEditor('room', { ...selectedRoom, buildingId: managingBuilding.id })}>Edit room</button><button type="button" className="admin-button admin-button--secondary" disabled={!selectedRoom} onClick={() => deleteRecord(`/admin/rooms/${selectedRoom.id}`, `room ${selectedRoom.room_number}`)}>Remove room</button><button type="button" className="admin-button admin-button--primary" onClick={() => openEditor('room', { buildingId: managingBuilding.id, room_number: '' })}>＋ Add room</button><button type="button" className="admin-button admin-button--secondary" onClick={() => setManagingBuildingId(null)}>Done</button></div>
        </div>}
      </> : <>
        <div className="admin-table-header"><span>Categories available on request forms</span><button type="button" className="admin-button admin-button--primary" onClick={() => openEditor('category', { name: '' })}>＋ Add category</button></div>
        {editor?.type === 'category' && <form className="admin-management-form" onSubmit={saveEditor}><h3>{editor.id ? 'Edit category' : 'Add category'}</h3><label>Category name<input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} required /></label><div className="admin-management-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => setEditor(null)}>Cancel</button><button className="admin-button admin-button--primary" disabled={isSaving}>{isSaving ? 'Saving…' : editor.id ? 'Save changes' : 'Add category'}</button></div></form>}
        {isLoading ? <p className="admin-request-empty">Loading categories…</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Category</th><th>Actions</th></tr></thead><tbody>
          {data.categories.map((category) => <tr key={category.id}><td>{category.name}</td><td><div className="admin-row-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => openEditor('category', { id: category.id, name: category.name })}>Edit</button><button type="button" className="admin-link-button" onClick={() => deleteRecord(`/admin/categories/${category.id}`, category.name)}>Remove</button></div></td></tr>)}
          {data.categories.length === 0 && <tr><td colSpan="2" className="admin-request-empty">No categories yet.</td></tr>}
        </tbody></table></div>}
      </>}
    </section>
  )
}

export default function AdminManagement({ view }) {
  return view === 'users' ? <UsersView /> : <FacilitiesView />
}

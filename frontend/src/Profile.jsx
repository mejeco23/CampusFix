import { useState } from 'react'
import { Sidebar } from './Dashboard.jsx'
import useAuth from './useAuth.js'

function Profile({ user, logout }) {
  const { updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email })
  const [photo, setPhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user.profile_photo_url || '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaved(false)
    setIsSaving(true)

    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('email', form.email)
      if (photo) payload.append('photo', photo)

      await updateProfile(payload)
      setSaved(true)
      setPhoto(null)
    } catch (requestError) {
      const errors = requestError.response?.data?.errors
      setError(errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || 'Could not save your profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handlePhotoChange(event) {
    const nextPhoto = event.target.files?.[0] || null
    setPhoto(nextPhoto)

    if (nextPhoto) {
      setPreviewUrl(URL.createObjectURL(nextPhoto))
      return
    }

    setPreviewUrl(user.profile_photo_url || '')
  }

  return (
    <div className="workspace-shell">
      <Sidebar user={user} logout={logout} active="profile" />
      <main className="workspace-main">
        <header className="mobile-workspace-brand"><a className="workspace-brand" href="/dashboard"><span className="brand-tool">✣</span><span>CampusFix</span></a></header>
        <div className="workspace-content">
          <div className="workspace-page-heading workspace-page-heading--compact">
            <div><p className="workspace-eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p className="workspace-subtitle">Update your name, email address, and photo.</p></div>
          </div>
          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div className="profile-photo-box profile-avatar--large">
                {previewUrl ? <img src={previewUrl} alt="Profile preview" /> : <span className="profile-avatar profile-avatar--large">{user.name.charAt(0).toUpperCase()}</span>}
              </div>
              <div><h2>Personal information</h2><p>Your account details used by CampusFix.</p></div>
            </div>
            {error && <p className="workspace-error" role="alert">{error}</p>}
            {saved && <p className="profile-success" role="status">Profile updated.</p>}
            <form className="profile-form" onSubmit={handleSubmit}>
              <label className="profile-field profile-field--photo">
                <span>Profile photo</span>
                <span className="profile-photo-upload">
                  <span className="profile-photo-upload__label">{photo ? photo.name : 'Choose a photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </span>
              </label>
              <label className="profile-field">Full name<input autoComplete="name" maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
              <label className="profile-field">Email address<input type="email" autoComplete="email" maxLength="255" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
              <div className="profile-actions"><a className="workspace-cancel" href="/dashboard">Cancel</a><button className="workspace-primary-action" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button></div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Profile
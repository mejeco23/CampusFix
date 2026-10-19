import useAuth from './useAuth.js'
import Dashboard from './Dashboard.jsx'
import Profile from './Profile.jsx'
import RequestForm from './RequestForm.jsx'
import Requests from './Requests.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import MaintenanceDashboard from './MaintenanceDashboard.jsx'
import LandingPage from './LandingPage.jsx'
import ContactUs from './ContactUs.jsx'
import './campusfix.css'

function App() {
  const { user, isLoading, logout } = useAuth()
  const path = window.location.pathname

  if (isLoading) {
    return (
      <main className="loading-screen" aria-label="Loading CampusFix">
        <span className="loading-mark">CF</span>
      </main>
    )
  }

  // Authenticated User Routing
  if (user) {
    if (path === '/profile') return <Profile user={user} logout={logout} />

    if (user.role === 'admin') return <AdminDashboard user={user} logout={logout} />
    if (user.role === 'maintenance') return <MaintenanceDashboard user={user} logout={logout} />

    if (path === '/create-request') return <RequestForm user={user} logout={logout} />
    if (path === '/requests') return <Requests user={user} logout={logout} />

    return <Dashboard user={user} logout={logout} />
  }

  // Unauthenticated Visitor Routing
  if (path === '/login') return <LandingPage initialAuthMode="login" />
  if (path === '/register') return <LandingPage initialAuthMode="register" />
  if (path === '/contact') return <ContactUs />

  // Root or any hash section (e.g. /#about) renders ONLY LandingPage
  return <LandingPage />
}

export default App
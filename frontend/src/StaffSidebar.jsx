const menus = {
  maintenance: {
    subtitle: 'Maintenance Operations',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { key: 'requests', label: 'Work orders', href: '/dashboard?view=requests' },
    ],
  },
  admin: {
    subtitle: 'Admin / Facility Management',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { key: 'review', label: 'Review & Assign', href: '/dashboard?view=review' },
      { key: 'users', label: 'Users & Facilities', href: '/dashboard?view=users' },
    ],
  },
}

export default function StaffSidebar({ user, logout, active }) {
  const menu = menus[user.role] || menus.maintenance

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand-wrap">
        <div className="admin-brand">
          <span className="admin-brand-mark">✦</span>
          <div><h1>CampusFix</h1><small>{menu.subtitle}</small></div>
        </div>
      </div>
      <nav className="admin-nav" aria-label="Staff navigation">
        {menu.items.map((item) => (
          <a key={item.key} className={active === item.key ? 'admin-nav-item active' : 'admin-nav-item'} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <div className="admin-nav-footer">
        <a className={active === 'profile' ? 'admin-nav-item active' : 'admin-nav-item'} href="/profile">Profile</a>
        <button type="button" className="admin-nav-item logout" onClick={logout}>Logout</button>
      </div>
    </aside>
  )
}
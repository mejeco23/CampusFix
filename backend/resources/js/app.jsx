import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const bootstrap = window.CAMPUSFIX ?? { page: 'login', props: {} };
const props = bootstrap.props ?? {};

const paths = {
    tools: <><path d="m14.7 6.3 3-3a5 5 0 0 1-6.4 6.4L5 16l3 3 6.3-6.3a5 5 0 0 1 6.4-6.4l-3 3-3-3Z"/><path d="m4 20 2-2M19 14l3 3-5 5-3-3 5-5ZM3 7l4-4 3 1-6 6-1-3Z"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/></>,
    create: <><path d="M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/><path d="m16 3 5 5M10 14l9-9 3 3-9 9-4 1 1-4Z"/></>,
    requests: <><path d="M7 3h10l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M17 3v5h5M9 12h8M9 16h8M3 7v14"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    document: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    progress: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2M16 3v5h5"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 6-7"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    image: <><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 5-5 3 3 3-3 4 4M12 3v5m-2-2 2 2 2-2"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
};

function Icon({ name, className = '' }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand({ compact = false }) {
    return <a className={`brand${compact ? ' brand--compact' : ''}`} href="/dashboard"><Icon name="tools" /><span>CampusFix</span></a>;
}

function Notice({ children, kind = 'success' }) {
    if (!children) return null;
    return <div className={`notice notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>;
}

function AuthPage({ page, data }) {
    const isLogin = page === 'login';
    const isRegister = page === 'register';
    const isForgot = page === 'forgot-password';
    const isReset = page === 'reset-password';
    const title = isLogin ? 'Welcome back' : isRegister ? 'Create your account' : isForgot ? 'Reset your password' : 'Choose a new password';
    const firstError = Object.values(data.errors ?? {})[0]?.[0];
    const old = data.old ?? {};

    return <main className="auth-page">
        <section className={`auth-card${isRegister ? ' auth-card--register' : ''}`}>
            <Brand />
            <p className="auth-tagline">Report <span>·</span> Track <span>·</span> Keep Campus Safe</p>
            <h1 className="sr-only">{title}</h1>
            <Notice kind="error">{firstError}</Notice>
            <Notice>{data.status}</Notice>
            {isLogin && <form className="auth-form" method="POST" action="/login">
                <input type="hidden" name="_token" value={csrfToken()} />
                <AuthInput icon="mail" label="Email address" name="email" type="email" placeholder="Email Address" defaultValue={old.email ?? ''} autoComplete="email" autoFocus />
                <AuthInput icon="lock" label="Password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
                <div className="auth-options"><label className="check-label"><input type="checkbox" name="remember" value="1" /><span>Remember me</span></label><a href="/forgot-password">Forgot password?</a></div>
                <button className="button button--primary button--wide" type="submit">Login</button>
                <p className="auth-switch">Don't have an account? <a href="/register">Register</a></p>
            </form>}
            {isRegister && <form className="auth-form" method="POST" action="/register">
                <input type="hidden" name="_token" value={csrfToken()} />
                <AuthInput icon="person" label="Full name" name="name" type="text" placeholder="Full Name" defaultValue={old.name ?? ''} autoComplete="name" autoFocus />
                <AuthInput icon="mail" label="Email address" name="email" type="email" placeholder="Email Address" defaultValue={old.email ?? ''} autoComplete="email" />
                <AuthInput icon="lock" label="Password" name="password" type="password" placeholder="Password (8 characters minimum)" autoComplete="new-password" />
                <AuthInput icon="lock" label="Confirm password" name="password_confirmation" type="password" placeholder="Confirm Password" autoComplete="new-password" />
                <button className="button button--primary button--wide" type="submit">Register</button>
                <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
            </form>}
            {isForgot && <form className="auth-form auth-form--stack" method="POST" action="/forgot-password">
                <input type="hidden" name="_token" value={csrfToken()} />
                <p className="auth-description">Enter the email connected to your account and we'll send a password reset link.</p>
                <AuthInput label="Email address" name="email" type="email" placeholder="Email Address" defaultValue={old.email ?? ''} autoComplete="email" autoFocus />
                <button className="button button--primary button--wide" type="submit">Send reset link</button>
                <p className="auth-switch"><a href="/login">Back to login</a></p>
            </form>}
            {isReset && <form className="auth-form auth-form--stack" method="POST" action="/reset-password">
                <input type="hidden" name="_token" value={csrfToken()} /><input type="hidden" name="token" value={data.token ?? ''} />
                <AuthInput label="Email address" name="email" type="email" defaultValue={data.email ?? ''} autoComplete="email" />
                <AuthInput label="New password" name="password" type="password" autoComplete="new-password" />
                <AuthInput label="Confirm password" name="password_confirmation" type="password" autoComplete="new-password" />
                <button className="button button--primary button--wide" type="submit">Update password</button>
            </form>}
        </section>
    </main>;
}

function AuthInput({ icon, label, ...inputProps }) {
    return <label className={`auth-input${icon ? ' auth-input--icon' : ''}`}>
        {icon && <Icon name={icon} />}<span className="sr-only">{label}</span><input {...inputProps} required />
    </label>;
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function AppLayout({ children, user, active }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const firstName = user?.name?.split(' ')[0] ?? 'there';
    const initials = user?.name?.slice(0, 1)?.toUpperCase() ?? 'U';

    return <div className="app-shell">
        {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
        <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`}>
            <Brand />
            <nav className="side-nav" aria-label="Main navigation">
                <a className={`side-link${active === 'dashboard' ? ' is-active' : ''}`} href="/dashboard"><Icon name="home" /><span>Home</span></a>
                <a className={`side-link${active === 'create' ? ' is-active' : ''}`} href="/requests/create"><Icon name="create" /><span>Create Request</span></a>
                <a className={`side-link${active === 'requests' ? ' is-active' : ''}`} href="/requests"><Icon name="requests" /><span>My Requests</span></a>
            </nav>
            <div className="sidebar-bottom">
                <div className="profile-chip"><span className="avatar">{initials}</span><span className="profile-copy"><strong>{user?.name}</strong><small>{user?.email}</small></span></div>
                <form method="POST" action="/logout"><input type="hidden" name="_token" value={csrfToken()} /><button className="side-link side-link--button" type="submit"><Icon name="logout" /><span>Logout</span></button></form>
            </div>
        </aside>
        <div className="app-main">
            <header className="mobile-header"><Brand compact /><button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button></header>
            <main className="content-area"><Notice>{props.status}</Notice>{children({ firstName })}</main>
        </div>
    </div>;
}

const statDetails = [
    { key: 'total', label: 'Total requests', icon: 'document', tone: 'ink' },
    { key: 'pending', label: 'Pending', icon: 'clock', tone: 'yellow' },
    { key: 'in_progress', label: 'In progress', icon: 'progress', tone: 'blue' },
    { key: 'completed', label: 'Completed', icon: 'check', tone: 'green' },
];

function Dashboard({ data, user }) {
    const stats = data.stats ?? {};
    const requests = data.requests ?? [];
    return <AppLayout user={user} active="dashboard">{({ firstName }) => <>
        <div className="page-heading"><div><p className="eyebrow">CAMPUS MAINTENANCE</p><h1>Welcome, {firstName}!</h1><p className="page-subtitle">Here's an overview of your maintenance requests.</p></div><a className="button button--primary" href="/requests/create"><Icon name="plus" />Create request</a></div>
        <section className="stats-grid" aria-label="Request summary">{statDetails.map((stat) => <article className={`stat-card stat-card--${stat.tone}`} key={stat.key}><span className="stat-icon"><Icon name={stat.icon} /></span><span className="stat-label">{stat.label}</span><strong>{stats[stat.key] ?? 0}</strong></article>)}</section>
        <section className="section-block"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>Recent requests</h2></div><a className="text-link" href="/requests">View all <span aria-hidden="true">→</span></a></div><RequestTable requests={requests} compact /></section>
    </>}</AppLayout>;
}

function RequestsPage({ data, user }) {
    const requests = data.requests ?? [];
    const pagination = data.pagination ?? {};
    return <AppLayout user={user} active="requests">{() => <>
        <div className="page-heading"><div><p className="eyebrow">TRACK YOUR REPORTS</p><h1>My requests</h1><p className="page-subtitle">Updates and status for the issues you've reported.</p></div><a className="button button--primary" href="/requests/create"><Icon name="plus" />Create request</a></div>
        <RequestTable requests={requests} />
        {pagination.last_page > 1 && <nav className="pagination" aria-label="Request pages">{pagination.current_page > 1 && <a href={`?page=${pagination.current_page - 1}`} aria-label="Previous page">←</a>}<span>Page {pagination.current_page} of {pagination.last_page}</span>{pagination.current_page < pagination.last_page && <a href={`?page=${pagination.current_page + 1}`} aria-label="Next page">→</a>}</nav>}
    </>}</AppLayout>;
}

function RequestTable({ requests, compact = false }) {
    const columns = compact ? ['ID', 'Title', 'Category', 'Status', 'Date'] : ['ID', 'Title', 'Category', 'Location', 'Priority', 'Status', 'Date'];
    return <div className="table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {requests.length ? requests.map((request) => <tr key={request.id}><td className="id-cell">#{String(request.id).padStart(4, '0')}</td><td className="title-cell">{request.title}</td><td>{request.category}</td>{!compact && <td>{request.building}, {request.room}</td>}{!compact && <td><span className={`priority-label priority-label--${request.priority}`}>{capitalize(request.priority)}</span></td>}<td><span className={`status-pill status-pill--${request.status?.replaceAll('_', '-')}`}>{request.status?.replaceAll('_', ' ')}</span></td><td>{formatDate(request.created_at)}</td></tr>) : <tr><td className="table-empty" colSpan={columns.length}><span className="empty-mark"><Icon name="plus" /></span><strong>No requests yet</strong><span>Create a request when something on campus needs attention.</span><a className="button button--secondary" href="/requests/create">Create your first request</a></td></tr>}
    </tbody></table></div>;
}

function CreateRequest({ user }) {
    const fileInput = useRef(null);
    const [photoName, setPhotoName] = useState('Click to upload or drag and drop');
    const [dragging, setDragging] = useState(false);
    const categories = ['Electrical', 'Plumbing', 'Furniture', 'IT Equipment', 'Cleaning', 'Other'];
    const fieldErrors = props.errors ?? {};
    const firstError = Object.values(fieldErrors)[0]?.[0];

    function chooseFiles(files) {
        if (!files?.length) return;
        const transfer = new DataTransfer();
        transfer.items.add(files[0]);
        fileInput.current.files = transfer.files;
        setPhotoName(files[0].name);
    }

    function errorFor(name) {
        return fieldErrors[name]?.[0] ? <span className="field-error">{fieldErrors[name][0]}</span> : null;
    }

    return <AppLayout user={user} active="create">{() => <>
        <div className="page-heading page-heading--compact"><div><p className="eyebrow">LET US KNOW WHAT NEEDS FIXING</p><h1>Create maintenance request</h1><p className="page-subtitle">Add a few details so the right team can help.</p></div></div>
        <Notice kind="error">{firstError && 'Please review the highlighted fields and try again.'}</Notice>
        <form className="request-form" method="POST" action="/requests" encType="multipart/form-data">
            <input type="hidden" name="_token" value={csrfToken()} />
            <div className="form-grid">
                <Field label="Title" name="title" error={errorFor('title')} className="field-group--full"><input className="form-control" name="title" placeholder="e.g. Broken air conditioner" maxLength="150" defaultValue={props.old?.title ?? ''} required /></Field>
                <Field label="Category" name="category" error={errorFor('category')}><select className="form-control" name="category" defaultValue={props.old?.category ?? ''} required><option value="" disabled>Select category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></Field>
                <Field label="Priority" name="priority" error={errorFor('priority')}><select className="form-control" name="priority" defaultValue={props.old?.priority ?? 'medium'} required><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field>
                <Field label="Building" name="building" error={errorFor('building')}><input className="form-control" name="building" placeholder="Enter building" defaultValue={props.old?.building ?? ''} required /></Field>
                <Field label="Room" name="room" error={errorFor('room')}><input className="form-control" name="room" placeholder="e.g. Room 204" defaultValue={props.old?.room ?? ''} required /></Field>
                <Field label="Description" name="description" error={errorFor('description')} className="field-group--full"><textarea className="form-control form-textarea" name="description" rows="5" maxLength="5000" placeholder="Describe the issue and anything else the maintenance team should know." defaultValue={props.old?.description ?? ''} required /></Field>
                <div className="field-group field-group--full"><label htmlFor="photo">Photo <span className="optional-label">Optional</span></label><label className={`upload-zone${dragging ? ' upload-zone--dragging' : ''}`} htmlFor="photo" onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFiles(event.dataTransfer.files); }}><input ref={fileInput} className="upload-input" id="photo" name="photo" type="file" accept="image/*" onChange={(event) => chooseFiles(event.target.files)} /><Icon name="image" /><strong>{photoName}</strong><span>PNG, JPG or WEBP · Maximum 5 MB</span></label>{errorFor('photo')}</div>
            </div>
            <div className="form-actions"><a className="button button--quiet" href="/dashboard">Cancel</a><button className="button button--primary" type="submit">Submit request <Icon name="arrow" /></button></div>
        </form>
    </>}</AppLayout>;
}

function Field({ label, name, children, error, className = '' }) {
    const inputs = React.Children.map(children, (child, index) => React.isValidElement(child) && index === 0 ? React.cloneElement(child, { id: name }) : child);
    return <div className={`field-group ${className}`}><label htmlFor={name}>{label}<span className="required-mark">*</span></label>{inputs}{error}</div>;
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function capitalize(value = '') {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function App() {
    const page = bootstrap.page;
    if (['login', 'register', 'forgot-password', 'reset-password'].includes(page)) return <AuthPage page={page} data={props} />;
    if (page === 'dashboard') return <Dashboard data={props} user={props.user} />;
    if (page === 'requests') return <RequestsPage data={props} user={props.user} />;
    if (page === 'create-request') return <CreateRequest user={props.user} />;
    return <AuthPage page="login" data={props} />;
}

createRoot(document.getElementById('campusfix-root')).render(<React.StrictMode><App /></React.StrictMode>);
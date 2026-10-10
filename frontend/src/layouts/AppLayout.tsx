import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CheckSquare, CircleHelp, LayoutDashboard, LogOut, Menu, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  async function logout() { await signOut(); navigate('/login', { replace: true }); }
  const initials = (user?.name ?? 'U').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  const nav = <><div className="side-label">WORKSPACE</div><NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}><LayoutDashboard size={18} /> Overview</NavLink><NavLink to="/dashboard?view=tasks" className="nav-item" onClick={() => setMobileOpen(false)}><CheckSquare size={18} /> All tasks</NavLink><div className="sidebar-bottom"><div className="side-label">YOUR ACCOUNT</div><div className="account-card"><div className="avatar">{initials || 'U'}</div><div className="account-meta"><strong>{user?.name ?? 'Your account'}</strong><span>{user?.email ?? ''}</span></div><button className="icon-button logout-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button></div><div className="sidebar-note"><div className="note-icon"><Settings2 size={17} /></div><div><strong>One step at a time</strong><p>Progress beats perfection.</p></div></div></div></>;
  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="/dashboard"><span className="brand-mark"><CheckSquare size={19} /></span><span>taskflow<span className="brand-period">.</span></span></a><nav className="sidebar-nav">{nav}</nav><div className="sidebar-foot"><CircleHelp size={15} /> Made for focused work</div></aside>
    <header className="mobile-header"><button className="icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button><a className="brand" href="/dashboard"><span className="brand-mark"><CheckSquare size={18} /></span>taskflow<span className="brand-period">.</span></a><div className="avatar avatar-small">{initials || 'U'}</div></header>
    {mobileOpen && <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)}><aside className="mobile-sidebar" onClick={(e) => e.stopPropagation()}><div className="mobile-nav-inner">{nav}</div></aside></div>}
    <main className="main-area"><Outlet /></main></div>;
}

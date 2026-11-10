import type { FormEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS: Array<{ to: string; icon: string; label: string }> = [
  { to: '/overview', icon: '◫', label: 'Overview' },
  { to: '/markets', icon: '⌝', label: 'Markets' },
  { to: '/charts', icon: '▥', label: 'Charts' },
  { to: '/news', icon: '◷', label: 'News & calendar' },
  { to: '/risk', icon: '◇', label: 'Risk tools' },
  { to: '/journal', icon: '▤', label: 'Trading journal' },
  { to: '/analysis', icon: '✳', label: 'Confluence lab' },
  { to: '/backtesting', icon: '↗', label: 'Backtesting' },
  { to: '/automation', icon: '⚙', label: 'Automation' },
  { to: '/investments', icon: '◉', label: 'Investments' },
];

const CRUMBS: Record<string, string> = {
  '/overview': 'Overview',
  '/markets': 'Markets',
  '/charts': 'Charts',
  '/news': 'News & calendar',
  '/risk': 'Risk tools',
  '/journal': 'Trading journal',
  '/analysis': 'Confluence analysis',
  '/backtesting': 'Backtesting',
  '/automation': 'Automation',
  '/investments': 'Investments',
  '/profile': 'Profile & preferences',
};

export default function AppShell() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const crumb = CRUMBS[location.pathname] ?? 'Workspace';
  const initial = (profile.name?.trim().charAt(0) || 'B').toUpperCase();
  const photo = profile.photo;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get('q') ?? '').trim();
    navigate(query ? `/markets?q=${encodeURIComponent(query)}` : '/markets');
  };

  const avatarStyle = photo ? { backgroundImage: `url(${JSON.stringify(photo)})` } : undefined;

  return (
    <div className="app">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">B</div>
          <div>
            <strong>BETZO</strong>
            <small>FINANCIAL INTELLIGENCE</small>
          </div>
        </div>
        <div>
          <div className="nav-title">Workspace</div>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ico" aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <strong>BUILD YOUR EDGE</strong>
          <p>Track decisions. Test ideas. Manage risk with discipline.</p>
          <NavLink className="tiny-btn" to="/journal">＋ Record a trade</NavLink>
        </div>
      </aside>

      <main>
        <nav className="mobile-nav" aria-label="Workspace sections">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <header className="topbar">
          <div className="crumb">Workspace&nbsp; / &nbsp;<b>{crumb}</b></div>
          <div className="top-actions">
            <form onSubmit={handleSearch} role="search">
              <input className="search" name="q" placeholder="Search symbols, markets…" aria-label="Search symbols" />
            </form>
            <div className="status"><span className="dot" aria-hidden="true" />Demo workspace</div>
            <button
              className="avatar"
              type="button"
              style={avatarStyle}
              onClick={() => navigate('/profile')}
              aria-label="Open profile and preferences"
            >
              {photo ? '' : initial}
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
          <div className="footer-note">
            BETZO prototype · Sample data only · Not financial advice · No live prices, broker connections, or order execution
          </div>
        </div>
      </main>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="public-shell public-welcome">
      <div className="public-content">
        <div className="public-top-actions" style={{ marginBottom: 8 }}>
          <div className="brand" style={{ marginRight: 'auto' }}>
            <div className="brand-mark" aria-hidden="true">B</div>
            <div>
              <strong>BETZO</strong>
              <small>FINANCIAL INTELLIGENCE</small>
            </div>
          </div>
          <Link className="btn" to="/login">Sign in</Link>
          <Link className="btn primary" to="/signup">Create account</Link>
        </div>

        <div className="public-hero">
          <div>
            <div className="eyebrow">A clearer way to read markets</div>
            <h1>Research with context.<br />Plan with discipline.</h1>
            <p>
              BETZO brings market discovery, chart analysis, trade planning, and portfolio tracking
              into one focused workspace. Data status stays visible so you know what is live,
              illustrative, or unavailable.
            </p>
            <div className="public-cta">
              <button className="btn primary" type="button" onClick={() => navigate('/signup')}>
                Create your workspace
              </button>
              <button className="btn" type="button" onClick={() => navigate('/login')}>
                Sign in to open workspace
              </button>
            </div>
            <div className="chart-footnote">The current preview uses illustrative market bars. No broker is connected and no orders are sent.</div>
            <div className="chart-footnote">
              Photo sources:{' '}
              <a href="https://unsplash.com/photos/trader-analyzing-stock-market-charts-on-multiple-screens-j_hho1mE47s" target="_blank" rel="noopener noreferrer">welcome</a>
              {' · '}
              <a href="https://unsplash.com/photos/laptop-on-desk-edMu3cQKrho" target="_blank" rel="noopener noreferrer">sign in</a>
              {' · '}
              <a href="https://unsplash.com/photos/a-person-using-a-laptop-computer-with-a-chart-on-the-screen-InWI1lteYfU" target="_blank" rel="noopener noreferrer">sign up</a>.
            </div>
          </div>
          <div className="public-art">
            <svg viewBox="0 0 560 330" role="img" aria-label="Original BETZO market analysis illustration">
              <defs>
                <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b82f6" stopOpacity=".22" />
                  <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="#294361" strokeWidth="1">
                <path d="M35 50H520M35 105H520M35 160H520M35 215H520M35 270H520" />
              </g>
              <path d="M36 233L78 215 116 222 151 180 190 198 228 151 266 166 300 124 340 146 378 105 415 119 454 74 518 91V285H36Z" fill="url(#heroFade)" />
              <path d="M36 233L78 215 116 222 151 180 190 198 228 151 266 166 300 124 340 146 378 105 415 119 454 74 518 91" fill="none" stroke="#60a5fa" strokeWidth="3" />
              <g strokeWidth="3">
                <path d="M95 90V145M95 102V132" stroke="#60a5fa" />
                <rect x="88" y="108" width="14" height="24" rx="2" fill="#60a5fa" />
                <path d="M172 120V180M172 130V166" stroke="#ff647c" />
                <rect x="165" y="132" width="14" height="31" rx="2" fill="#ff647c" />
                <path d="M249 81V145M249 95V123" stroke="#60a5fa" />
                <rect x="242" y="96" width="14" height="27" rx="2" fill="#60a5fa" />
                <path d="M327 76V137M327 90V117" stroke="#60a5fa" />
                <rect x="320" y="92" width="14" height="25" rx="2" fill="#60a5fa" />
                <path d="M405 60V121M405 70V103" stroke="#ff647c" />
                <rect x="398" y="72" width="14" height="31" rx="2" fill="#ff647c" />
              </g>
              <rect x="355" y="22" width="154" height="34" rx="9" fill="#12233a" stroke="#2a4d77" />
              <circle cx="373" cy="39" r="5" fill="#60a5fa" />
              <text x="386" y="43" fill="#c7defa" fontSize="11" fontFamily="sans-serif">PLAN · REVIEW · LEARN</text>
              <text x="36" y="310" fill="#7f91aa" fontSize="10" fontFamily="sans-serif">ILLUSTRATIVE DESIGN · NOT LIVE MARKET DATA</text>
            </svg>
          </div>
        </div>

        <div className="grid public-grid">
          <div className="card">
            <div className="eyebrow">Discover</div>
            <h2>Markets in one catalogue</h2>
            <p className="muted">Forex, stocks, ETFs, commodities, crypto, indices, bonds, and provider-specific synthetic instruments.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Analyze</div>
            <h2>Charts with context</h2>
            <p className="muted">Candles, intervals, moving averages, manual levels, Fibonacci, and documented trade plans.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Manage risk</div>
            <h2>Review before action</h2>
            <p className="muted">Risk estimates and paper-only automation drafts keep assumptions visible and orders disabled.</p>
          </div>
        </div>

        <div className="callout">
          <div className="callout-icon" aria-hidden="true">i</div>
          <div>
            <h3>Built to evolve, not promise the future</h3>
            <p>Long-term reliability comes from maintainable architecture, licensed data, security updates, and regular review. BETZO makes no “100-year” durability guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

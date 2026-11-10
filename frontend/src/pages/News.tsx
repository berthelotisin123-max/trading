export default function News() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Market intelligence</div>
          <h1>News &amp; economic calendar</h1>
          <p>Follow fundamental drivers, technical coverage, and scheduled market events with source attribution.</p>
        </div>
      </div>

      <div className="catalog-note">
        <b>Live news and event data are not connected.</b> BETZO will not copy third-party article text or
        invent current headlines. Select a source to read its latest coverage while provider licensing is evaluated.
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Financial news</h2>
              <p>Forex Factory editorial categories</p>
            </div>
            <span className="tag neutral">Source links</span>
          </div>
          <div className="watchlist">
            <div className="market-row">
              <div><b>Breaking news</b><div className="muted">Market-moving developments grouped by reported impact.</div></div>
              <span className="tag warn">High / Med / Low</span>
            </div>
            <div className="market-row">
              <div><b>Fundamental analysis</b><div className="muted">Economic releases, central banks, policy, and market drivers.</div></div>
              <span className="tag neutral">Not connected</span>
            </div>
            <div className="market-row">
              <div><b>Technical analysis</b><div className="muted">Price-based commentary and chart analysis from publishers.</div></div>
              <span className="tag neutral">Not connected</span>
            </div>
            <div className="market-row">
              <div><b>Forex industry &amp; education</b><div className="muted">Industry developments and educational coverage.</div></div>
              <span className="tag neutral">Not connected</span>
            </div>
          </div>
          <a className="btn primary" style={{ display: 'inline-flex', marginTop: 16 }} href="https://www.forexfactory.com/news" target="_blank" rel="noopener noreferrer">
            Open Forex Factory news
          </a>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Economic calendar</h2>
              <p>Events, impact, forecast, actual, and previous values</p>
            </div>
            <span className="tag neutral">Not connected</span>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            Calendar times, country/currency filters, and actual/forecast values require an authorized
            calendar feed. No event data is shown as current here.
          </p>
          <a className="btn" href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">
            Open Forex Factory calendar
          </a>
          <div className="callout" style={{ marginTop: 16 }}>
            <div className="callout-icon" aria-hidden="true">i</div>
            <div>
              <h3>Data attribution</h3>
              <p>When BETZO connects a licensed feed, it will show publisher, event time, timezone, and data freshness beside each item.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

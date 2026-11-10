import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from '../components/Chart';
import type { ChartTimeframe } from '../components/Chart';
import { CHART_UNIVERSE, tradingViewUrl } from '../lib/instruments';
import { readJson } from '../lib/storage';

interface StoredTrade {
  date: string;
  symbol: string;
  asset: string;
  direction: string;
  setup: string;
  result: string;
  notes: string;
}

const SAMPLE_ROWS = [
  { instrument: 'XAUUSD · BUY', setup: 'Liquidity sweep', result: '+1.8R', cls: 'positive', tag: 'Win', tagCls: '' },
  { instrument: 'EURUSD · SELL', setup: 'FVG retracement', result: '−1R', cls: 'negative', tag: 'Loss', tagCls: 'warn' },
  { instrument: 'US 500 · BUY', setup: 'Break of structure', result: '+0.7R', cls: '', tag: 'Win', tagCls: '' },
];

export default function Overview() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<StoredTrade[]>([]);
  const [symbol, setSymbol] = useState('XAUUSD');

  useEffect(() => {
    setTrades(readJson<StoredTrade[]>('betzoTrades', []));
  }, []);

  const journalCount = 24 + trades.length;

  const handleAnalyze = (chartSymbol: string, interval: ChartTimeframe) =>
    navigate(`/analysis?symbol=${encodeURIComponent(chartSymbol)}&timeframe=${encodeURIComponent(interval)}`);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Market intelligence platform</div>
          <h1>Good day, Trader.</h1>
          <p>Your multi-asset workspace at a glance.</p>
        </div>
        <div className="head-buttons">
          <button className="btn" type="button" onClick={() => navigate('/markets')}>Explore markets</button>
          <button className="btn primary" type="button" onClick={() => navigate('/journal')}>＋ Log a trade</button>
        </div>
      </div>

      <div className="grid stats">
        <div className="card">
          <div className="stat-label">Tracked assets <span aria-hidden="true">◉</span></div>
          <div className="stat-value">12</div>
          <div className="stat-foot">Across 8 asset classes</div>
        </div>
        <div className="card">
          <div className="stat-label">Journaled trades <span aria-hidden="true">▤</span></div>
          <div className="stat-value">{journalCount}</div>
          <div className="stat-foot">24 sample records + your locally saved entries</div>
        </div>
        <div className="card">
          <div className="stat-label">Win rate <span aria-hidden="true">↗</span></div>
          <div className="stat-value">58.3%</div>
          <div className="stat-foot">Illustrative historical metric</div>
        </div>
        <div className="card">
          <div className="stat-label">Risk status <span aria-hidden="true">◇</span></div>
          <div className="stat-value positive" style={{ fontSize: 20 }}>Within limits</div>
          <div className="stat-foot">No live broker connected</div>
        </div>
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Market overview</h2>
              <p>Illustrative chart — not live market data</p>
            </div>
            <select
              className="chart-symbol-select"
              style={{ width: 'auto', maxWidth: 240 }}
              aria-label="Chart instrument"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
            >
              {CHART_UNIVERSE.map(({ symbol: s, category }) => (
                <option key={s} value={s}>{s} · {category}</option>
              ))}
            </select>
          </div>
          <Chart symbol={symbol} persistId="overview" compact onAnalyze={handleAnalyze} />
          <div className="chart-legend">
            <span><i className="legend-dot" style={{ background: 'var(--primary)' }} />Illustrative OHLC bars · arbitrary demo units · not live market data</span>
            <a className="icon-link" href={tradingViewUrl(symbol)} target="_blank" rel="noopener noreferrer">↗ Open chart on TradingView</a>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Watchlist</h2>
              <p>Example instruments across markets</p>
            </div>
            <button className="pill" type="button" onClick={() => navigate('/markets')}>View all</button>
          </div>
          <div className="watchlist">
            {[
              { icon: 'Au', name: 'XAUUSD', detail: 'Gold · Commodity', change: '+0.42%', cls: 'positive' },
              { icon: '€$', name: 'EURUSD', detail: 'Forex', change: '−0.12%', cls: 'negative' },
              { icon: '500', name: 'US 500', detail: 'Stock index', change: '+0.31%', cls: 'positive' },
              { icon: 'V', name: 'Volatility Index', detail: 'Synthetic · provider-specific', change: '−0.27%', cls: 'negative' },
              { icon: '₿', name: 'Bitcoin', detail: 'Crypto', change: '+1.08%', cls: 'positive' },
            ].map((row) => (
              <div className="market-row" key={row.name}>
                <div className="asset-name">
                  <div className="asset-icon">{row.icon}</div>
                  <div><b>{row.name}</b><small>{row.detail}</small></div>
                </div>
                <div className="price">Sample</div>
                <div className={`change ${row.cls}`}>{row.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Recent journal activity</h2>
              <p>Example records — edit by adding your own trades</p>
            </div>
            <button className="pill" type="button" onClick={() => navigate('/journal')}>Open journal</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Instrument</th><th>Setup</th><th>Result</th><th>Status</th></tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((row) => (
                  <tr key={row.instrument}>
                    <td>{row.instrument}</td>
                    <td>{row.setup}</td>
                    <td className={row.cls}>{row.result}</td>
                    <td><span className={`tag ${row.tagCls}`.trim()}>{row.tag}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Risk discipline</h2>
              <p>Example rule checklist</p>
            </div>
            <span className="tag">Practice</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>Risk checklist completed</span>
            <b>4 / 5</b>
          </div>
          <div className="progress" aria-hidden="true"><span style={{ width: '80%' }} /></div>
          <div style={{ display: 'grid', gap: 11, marginTop: 16, color: 'var(--muted)', fontSize: 12.5 }}>
            <div>✓ Define stop-loss before entry</div>
            <div>✓ Confirm risk per trade</div>
            <div>✓ Record setup rationale</div>
            <div>✓ Check scheduled news</div>
            <div>○ Review correlated exposure</div>
          </div>
        </div>
      </div>

      <div className="callout">
        <div className="callout-icon" aria-hidden="true">✳</div>
        <div>
          <h3>Research first. Execute carefully.</h3>
          <p>This prototype is a local UI preview. Prices, metrics, and chart movements are illustrative placeholders, not live quotes or investment advice.</p>
        </div>
      </div>
    </>
  );
}

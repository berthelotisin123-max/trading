import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from '../components/Chart';
import type { ChartTimeframe } from '../components/Chart';
import { CHART_UNIVERSE, tradingViewUrl } from '../lib/instruments';

export default function Charts() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState('EURUSD');

  const handleAnalyze = (chartSymbol: string, interval: ChartTimeframe) =>
    navigate(`/analysis?symbol=${encodeURIComponent(chartSymbol)}&timeframe=${encodeURIComponent(interval)}`);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Price action workspace</div>
          <h1>Charts</h1>
          <p>Inspect candles and intervals. Connect a licensed feed before using charts for market decisions.</p>
        </div>
        <a className="btn icon-link" href={tradingViewUrl(symbol)} target="_blank" rel="noopener noreferrer">
          ↗ Open on TradingView
        </a>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>{symbol}</h2>
            <p>Illustrative OHLC bars · no live market data</p>
          </div>
          <select
            className="chart-symbol-select"
            aria-label="Chart instrument"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
          >
            {CHART_UNIVERSE.map(({ symbol: s, category }) => (
              <option key={s} value={s}>{s} · {category}</option>
            ))}
          </select>
        </div>
        <Chart symbol={symbol} persistId="charts" onAnalyze={handleAnalyze} />
        <div className="chart-footnote">
          Sample bars use arbitrary demo units. OHLC values are illustrative, not quotes. Technical indicators, drawing persistence, alerts, and licensed data feeds are not connected.
        </div>
      </div>

      <div className="grid section-grid" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Chart workspace features</h2>
              <p>Planned capabilities</p>
            </div>
            <span className="tag neutral">Not connected</span>
          </div>
          <div className="watchlist">
            <div className="market-row"><span>Moving averages, Bollinger 20, RSI 14</span><span className="muted">Illustrative bars</span></div>
            <div className="market-row"><span>Manual zones, trendlines, Fibonacci &amp; plans</span><span className="muted">Local drawings</span></div>
            <div className="market-row"><span>Saved layouts and templates</span><span className="muted">Planned</span></div>
            <div className="market-row"><span>Price and technical alerts</span><span className="muted">Requires data service</span></div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Chart library review</h2>
              <p>Initial technical evaluation</p>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            TradingView Lightweight Charts is open-source under Apache 2.0. The advanced charting and
            trading libraries are proprietary and require an application request and license review.
            This prototype uses native SVG and does not embed TradingView software.
          </p>
          <a href="https://www.tradingview.com/free-charting-libraries/" target="_blank" rel="noopener noreferrer">
            Read official library terms
          </a>
        </div>
      </div>
    </>
  );
}

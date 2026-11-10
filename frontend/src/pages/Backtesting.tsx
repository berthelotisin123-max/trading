import { useState } from 'react';
import type { FormEvent } from 'react';
import { useToast } from '../context/ToastContext';

export default function Backtesting() {
  const { toast } = useToast();
  const [message, setMessage] = useState('A real backtest requires historical data and a defined entry/exit algorithm.');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const spread = Number(data.get('spread'));
    const commission = Number(data.get('commission'));
    const slippage = Number(data.get('slippage'));

    if (![spread, commission, slippage].every((v) => Number.isFinite(v) && v >= 0)) {
      setMessage('Enter non-negative cost assumptions before validating this configuration.');
      return;
    }
    setMessage(
      `Configuration captured: spread ${spread}, commission ${commission}, slippage ${slippage}. Historical data and an implemented strategy engine are still required; no backtest has run.`,
    );
    toast('Configuration validated — no backtest has run.');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Strategy research</div>
          <h1>Backtesting lab</h1>
          <p>Plan a reproducible test before risking capital.</p>
        </div>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head"><h2>Test configuration</h2><span className="tag warn">Prototype</span></div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>Instrument<input name="instrument" defaultValue="XAUUSD" required /></label>
            <label>Strategy
              <select name="strategy" defaultValue="ICT / SMC setup">
                <option>ICT / SMC setup</option>
                <option>Moving average crossover</option>
                <option>Custom rules</option>
              </select>
            </label>
            <label>Timeframe
              <select name="timeframe" defaultValue="15 minutes">
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
                <option>1 day</option>
              </select>
            </label>
            <label>Starting balance<input name="balance" type="number" defaultValue="1000" min="1" required /></label>
            <label>Risk per trade (%)<input name="riskPct" type="number" defaultValue="1" min="0.1" max="100" step="0.1" required /></label>
            <label>Data source
              <select name="dataSource" defaultValue="Not connected">
                <option>Not connected</option>
                <option>Import CSV (future feature)</option>
              </select>
            </label>
            <label>Spread assumption (price units)<input name="spread" type="number" min="0" step="any" defaultValue="0" required /></label>
            <label>Commission per trade (account currency)<input name="commission" type="number" min="0" step="any" defaultValue="0" required /></label>
            <label>Slippage per execution (price units)<input name="slippage" type="number" min="0" step="any" defaultValue="0" required /></label>
            <label className="full">Entry and exit rules
              <textarea name="rules" rows={3} placeholder="Describe exact conditions; a real engine is not connected." />
            </label>
            <div className="full"><button className="btn primary" type="submit">Validate test configuration</button></div>
          </form>
          <p className="muted" style={{ fontSize: 12, marginBottom: 0 }} aria-live="polite">{message}</p>
        </div>

        <div className="card">
          <div className="card-head"><h2>Required report metrics</h2></div>
          <div className="watchlist">
            <div className="market-row"><span>Net return</span><span className="muted">Not calculated</span></div>
            <div className="market-row"><span>Maximum drawdown</span><span className="muted">Not calculated</span></div>
            <div className="market-row"><span>Profit factor</span><span className="muted">Not calculated</span></div>
            <div className="market-row"><span>Transaction costs</span><span className="muted">Not configured</span></div>
            <div className="market-row"><span>Out-of-sample test</span><span className="muted">Not configured</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

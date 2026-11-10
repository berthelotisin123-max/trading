import { useState } from 'react';
import type { FormEvent } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { useToast } from '../context/ToastContext';

interface ManualHolding {
  name: string;
  type: string;
}

const HOLDINGS_KEY = 'betzoHoldings';

const SAMPLE_HOLDINGS = [
  { asset: 'Example Equity', type: 'Stocks' },
  { asset: 'Example Market ETF', type: 'ETF' },
  { asset: 'Example Government Bond', type: 'Bonds' },
  { asset: 'Gold', type: 'Commodity' },
];

export default function Investments() {
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<ManualHolding[]>(() => readJson<ManualHolding[]>(HOLDINGS_KEY, []));
  const [adding, setAdding] = useState(false);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const type = String(data.get('type') ?? '').trim() || 'Other';
    if (!name) return;
    const next = [...holdings, { name, type }];
    setHoldings(next);
    writeJson(HOLDINGS_KEY, next);
    form.reset();
    setAdding(false);
    toast('Holding added and saved in this browser.');
  };

  const total = SAMPLE_HOLDINGS.length + holdings.length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Long-term wealth</div>
          <h1>Investment portfolio</h1>
          <p>Track assets and allocations. No brokerage or custody connection is active.</p>
        </div>
        <button className="btn primary" type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close form' : '＋ Add holding'}
        </button>
      </div>

      <div className="grid stats">
        <div className="card"><div className="stat-label">Tracked holdings</div><div className="stat-value">{total}</div><div className="stat-foot">{SAMPLE_HOLDINGS.length} sample + {holdings.length} saved locally</div></div>
        <div className="card"><div className="stat-label">Asset classes</div><div className="stat-value">4</div><div className="stat-foot">Equities, ETFs, bonds, commodities</div></div>
        <div className="card"><div className="stat-label">Live valuation</div><div className="stat-value" style={{ fontSize: 19 }}>Not connected</div><div className="stat-foot">No real-time prices</div></div>
        <div className="card"><div className="stat-label">Portfolio status</div><div className="stat-value positive" style={{ fontSize: 19 }}>Tracking only</div><div className="stat-foot">Not investment advice</div></div>
      </div>

      {adding && (
        <form className="card form-grid" style={{ marginBottom: 16 }} onSubmit={handleAdd}>
          <label>Asset name<input name="name" placeholder="e.g. Rwanda government bond" required /></label>
          <label>Asset class
            <select name="type" defaultValue="Stocks">
              <option>Stocks</option>
              <option>ETFs</option>
              <option>Bonds</option>
              <option>Commodities</option>
              <option>Crypto</option>
              <option>Cash</option>
              <option>Other</option>
            </select>
          </label>
          <div className="full"><button className="btn primary" type="submit">Save holding locally</button></div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Asset</th><th>Type</th><th>Quantity</th><th>Cost basis</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {SAMPLE_HOLDINGS.map((row) => (
              <tr key={row.asset}>
                <td>{row.asset}</td>
                <td>{row.type}</td>
                <td>—</td>
                <td>—</td>
                <td className="muted">Sample row</td>
              </tr>
            ))}
            {holdings.map((row, i) => (
              <tr key={`${row.name}-${i}`}>
                <td><b>{row.name}</b></td>
                <td>{row.type}</td>
                <td>—</td>
                <td>—</td>
                <td className="muted">Manually tracked · local browser</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout" style={{ marginTop: 16 }}>
        <div className="callout-icon" aria-hidden="true">◉</div>
        <div>
          <h3>Keep investing separate from trading</h3>
          <p>Portfolio tracking is distinct from brokerage execution, investment advice, and managing other people&apos;s money. Those activities may require licensed providers or regulatory authorization.</p>
        </div>
      </div>
    </>
  );
}

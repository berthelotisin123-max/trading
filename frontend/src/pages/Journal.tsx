import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import ScreenshotPicker from '../components/ScreenshotPicker';
import { loadScreenshots, saveScreenshots } from '../lib/idb';
import { csvEscape, downloadTextFile, readJson, writeJson } from '../lib/storage';
import { useToast } from '../context/ToastContext';

export interface StoredTrade {
  date: string;
  symbol: string;
  asset: string;
  direction: string;
  setup: string;
  result: string;
  notes: string;
  screenshotKey?: string;
  screenshotNames?: string[];
}

const JOURNAL_DB = 'betzo-journal-assets';
const TRADES_KEY = 'betzoTrades';

const SETUPS = ['Liquidity sweep', 'Order block', 'Fair value gap', 'Break of structure', 'Fundamental', 'Other'];
const ASSET_CLASSES = ['Forex', 'Synthetic Indices', 'Stocks', 'ETFs', 'Bonds', 'Commodities', 'Stock Indices', 'Crypto', 'Other'];

export default function Journal() {
  const { toast } = useToast();
  const [trades, setTrades] = useState<StoredTrade[]>(() => readJson<StoredTrade[]>(TRADES_KEY, []));
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotStatus, setScreenshotStatus] = useState('Images stay in this browser. They are not uploaded anywhere.');
  const [thumbnails, setThumbnails] = useState<Record<string, Array<{ name: string; url: string }>>>({});

  const persist = useCallback((next: StoredTrade[]) => {
    setTrades(next);
    writeJson(TRADES_KEY, next);
  }, []);

  // Load screenshot thumbnails for trades that have them.
  useEffect(() => {
    let cancelled = false;
    const keys = Array.from(new Set(trades.filter((t) => t.screenshotKey).map((t) => t.screenshotKey as string)));
    if (keys.length === 0) {
      setThumbnails({});
      return undefined;
    }
    Promise.all(
      keys.map((key) =>
        loadScreenshots(JOURNAL_DB, key)
          .then((files) => [key, files.map((f) => ({ name: f.name, url: URL.createObjectURL(f.blob) }))] as const)
          .catch(() => [key, []] as const),
      ),
    ).then((entries) => {
      if (cancelled) {
        entries.forEach(([, files]) => files.forEach((f) => URL.revokeObjectURL(f.url)));
        return;
      }
      setThumbnails(Object.fromEntries(entries.filter(([, files]) => files.length > 0)));
    });
    return () => { cancelled = true; };
  }, [trades]);

  const visibleTrades = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter((t) =>
      [t.date, t.symbol, t.asset, t.direction, t.setup, t.result, t.notes, ...(t.screenshotNames ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [trades, filter]);

  const stats = useMemo(() => {
    const wins = trades.filter((t) => Number(t.result) > 0).length;
    const losses = trades.filter((t) => Number(t.result) < 0).length;
    const net = trades.reduce((sum, t) => sum + (Number(t.result) || 0), 0);
    return { wins, losses, net };
  }, [trades]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const trade: StoredTrade = {
      symbol: String(data.get('symbol') ?? '').trim().toUpperCase(),
      direction: String(data.get('direction') ?? 'BUY'),
      asset: String(data.get('asset') ?? 'Other'),
      result: String(data.get('result') ?? '0'),
      setup: String(data.get('setup') ?? 'Other'),
      date: String(data.get('date') ?? ''),
      notes: String(data.get('notes') ?? '').trim(),
    };

    if (screenshotFiles.length > 0) {
      const key = `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        await saveScreenshots(JOURNAL_DB, key, screenshotFiles);
        trade.screenshotKey = key;
        trade.screenshotNames = screenshotFiles.map((f) => f.name);
      } catch {
        setScreenshotStatus('Could not save screenshots. Trade saved without images.');
      }
    }

    persist([trade, ...trades]);
    form.reset();
    setScreenshotFiles([]);
    setScreenshotStatus('Images stay in this browser. They are not uploaded anywhere.');
    setShowForm(false);
    toast('Trade saved in this browser.');
  };

  const handleExport = () => {
    if (trades.length === 0) {
      toast('There are no journal entries to export.');
      return;
    }
    const columns: Array<keyof StoredTrade> = ['date', 'symbol', 'asset', 'direction', 'setup', 'result', 'notes'];
    const csv = [
      columns.join(','),
      ...trades.map((t) => columns.map((k) => csvEscape(t[k])).join(',')),
    ].join('\r\n');
    downloadTextFile('betzo-trading-journal.csv', csv, 'text/csv;charset=utf-8');
    toast('Journal CSV exported.');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Performance</div>
          <h1>Trading journal</h1>
          <p>Record trades and review your decisions. Saved locally in this browser only.</p>
        </div>
        <button className="btn primary" type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : '＋ Add trade'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <h2>Record a trade</h2>
            <button className="pill" type="button" onClick={() => setShowForm(false)}>Close</button>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>Instrument<input name="symbol" placeholder="e.g. XAUUSD" required /></label>
            <label>Direction<select name="direction"><option>BUY</option><option>SELL</option></select></label>
            <label>Asset class<select name="asset">{ASSET_CLASSES.map((a) => <option key={a}>{a}</option>)}</select></label>
            <label>Outcome in R<input name="result" type="number" step="0.1" placeholder="e.g. 1.5" required /></label>
            <label>Setup<select name="setup">{SETUPS.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Date<input name="date" type="date" required /></label>
            <label className="full">Trade notes<textarea name="notes" rows={2} placeholder="Why did you enter? What did you learn?" /></label>
            <div className="full">
              <ScreenshotPicker
                label="Trade screenshots (PNG, JPG, or WebP — max 4 files, 8 MB each)"
                files={screenshotFiles}
                onChange={(files, message) => {
                  setScreenshotFiles(files);
                  setScreenshotStatus(message ?? `${files.length} screenshot(s) attached. Save the trade to keep them in this browser.`);
                }}
                status={screenshotStatus}
              />
            </div>
            <div className="full"><button className="btn primary" type="submit">Save trade locally</button></div>
          </form>
        </div>
      )}

      <div className="grid stats">
        <div className="card"><div className="stat-label">Recorded trades</div><div className="stat-value">{trades.length}</div><div className="stat-foot">Your locally saved entries</div></div>
        <div className="card"><div className="stat-label">Wins</div><div className="stat-value positive">{stats.wins}</div><div className="stat-foot">Trades with positive R</div></div>
        <div className="card"><div className="stat-label">Losses</div><div className="stat-value negative">{stats.losses}</div><div className="stat-foot">Trades with negative R</div></div>
        <div className="card"><div className="stat-label">Net result</div><div className="stat-value">{(stats.net > 0 ? '+' : '')}{stats.net.toFixed(1)}R</div><div className="stat-foot">Sum of recorded R values</div></div>
      </div>

      <div className="filters">
        <input
          aria-label="Filter trades"
          placeholder="Filter recorded trades…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <button className="btn" type="button" onClick={handleExport}>Export journal CSV</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Instrument</th><th>Class</th><th>Direction</th><th>Setup</th><th>Result</th><th>Notes</th><th>Screenshots</th>
            </tr>
          </thead>
          <tbody>
            {visibleTrades.map((trade, i) => {
              const numeric = Number(trade.result);
              const shots = trade.screenshotKey ? thumbnails[trade.screenshotKey] ?? [] : [];
              return (
                <tr key={`${trade.date}-${trade.symbol}-${i}`}>
                  <td>{trade.date}</td>
                  <td><b>{trade.symbol}</b></td>
                  <td>{trade.asset}</td>
                  <td>{trade.direction}</td>
                  <td>{trade.setup}</td>
                  <td className={numeric >= 0 ? 'positive' : 'negative'}>{numeric > 0 ? '+' : ''}{trade.result}R</td>
                  <td>{trade.notes || '—'}</td>
                  <td>
                    {shots.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {shots.map((shot) => (
                          <img
                            key={shot.name}
                            src={shot.url}
                            alt={`Trade screenshot: ${shot.name}`}
                            title={shot.name}
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                          />
                        ))}
                      </div>
                    ) : trade.screenshotNames?.length ? (
                      <span className="muted">{trade.screenshotNames.join(', ')}</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visibleTrades.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-state">
                  {trades.length ? 'No trades match this filter.' : 'No trades yet. Select “Add trade” to record your first entry.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

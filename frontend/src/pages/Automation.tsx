import { useState } from 'react';
import type { FormEvent } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { useToast } from '../context/ToastContext';

interface SignalDraft {
  symbol: string;
  direction: string;
  entry: number;
  stop: number;
  target: number;
  createdAt: string;
  fingerprint: string;
  status: 'draft-only-human-approval-required';
}

const DRAFTS_KEY = 'betzoSignalDrafts';
const SETTINGS_KEY = 'betzoAutomationSettings';

export default function Automation() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => {
    const saved = readJson<{ risk?: number | string; daily?: number | string }>(SETTINGS_KEY, {});
    return {
      risk: String(saved.risk ?? '1'),
      daily: String(saved.daily ?? '2'),
    };
  });
  const [result, setResult] = useState(
    'No signal imported. No AI, Telegram, broker, or MetaTrader connection is active. Validation creates a local draft only.',
  );
  const [draftCount, setDraftCount] = useState(() => readJson<SignalDraft[]>(DRAFTS_KEY, []).length);

  const saveSettings = () => {
    const risk = Number(settings.risk);
    const daily = Number(settings.daily);
    if (!Number.isFinite(risk) || risk <= 0 || risk > 2) {
      toast('Risk limit must be above 0 and no more than 2%.');
      return;
    }
    if (!Number.isFinite(daily) || daily <= 0 || daily > 5) {
      toast('Daily loss limit must be above 0 and no more than 5%.');
      return;
    }
    writeJson(SETTINGS_KEY, { risk, daily, requireHumanApproval: true, executionEnabled: false });
    toast('Guardrail draft saved locally; no orders can be sent.');
  };

  const handleDraftSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const symbol = String(data.get('symbol') ?? '').trim().toUpperCase();
    const direction = String(data.get('direction') ?? 'BUY').toUpperCase();
    const entry = Number(data.get('entry'));
    const stop = Number(data.get('stop'));
    const target = Number(data.get('target'));
    const riskLimit = Number(settings.risk);
    const dailyLimit = Number(settings.daily);
    const isLong = direction === 'BUY';
    const validLevels = isLong ? stop < entry && target > entry : stop > entry && target < entry;

    if (
      !symbol ||
      ![entry, stop, target, riskLimit, dailyLimit].every(Number.isFinite) ||
      !validLevels ||
      riskLimit <= 0 || riskLimit > 2 ||
      dailyLimit <= 0 || dailyLimit > 5
    ) {
      setResult('Rejected from the draft queue: instrument, levels, direction, or limits are invalid. Nothing was sent.');
      return;
    }

    const fingerprint = [symbol, direction, entry, stop, target].join('|');
    const drafts = readJson<SignalDraft[]>(DRAFTS_KEY, []);
    if (drafts.some((d) => d.fingerprint === fingerprint)) {
      setResult(`Duplicate draft rejected: an identical ${symbol} ${direction} intent already exists in the local queue. Review it instead of importing again.`);
      return;
    }

    const draft: SignalDraft = {
      symbol, direction, entry, stop, target,
      createdAt: new Date().toISOString(),
      fingerprint,
      status: 'draft-only-human-approval-required',
    };
    const next = [draft, ...drafts].slice(0, 50);
    writeJson(DRAFTS_KEY, next);
    setDraftCount(next.length);
    setResult(
      `Draft validated and queued locally as "${symbol} ${direction}" — entry ${entry}, stop ${stop}, target ${target}. Human approval is required and execution is disabled; nothing was sent to any broker. ${next.length} draft(s) in the local queue.`,
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Integrations</div>
          <h1>Trading automation</h1>
          <p>Plan integrations safely. No broker or Telegram account is connected in this prototype.</p>
        </div>
        <span className="tag warn">Demo only</span>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <h2>Signal review &amp; guardrails</h2>
            <p>Build an order-intent draft for human review</p>
          </div>
          <span className="tag warn">Execution disabled</span>
        </div>
        <form className="form-grid" onSubmit={handleDraftSubmit}>
          <label>Instrument<input name="symbol" placeholder="e.g. XAUUSD" required /></label>
          <label>Direction
            <select name="direction" defaultValue="BUY">
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </label>
          <label>Entry<input name="entry" type="number" step="any" required /></label>
          <label>Stop loss<input name="stop" type="number" step="any" required /></label>
          <label>Take profit<input name="target" type="number" step="any" required /></label>
          <label>
            Risk limit per trade (%)
            <input
              type="number" min="0.01" max="2" step="0.01"
              value={settings.risk}
              onChange={(e) => setSettings((s) => ({ ...s, risk: e.target.value }))}
            />
          </label>
          <label>
            Daily loss limit (%)
            <input
              type="number" min="0.1" max="5" step="0.1"
              value={settings.daily}
              onChange={(e) => setSettings((s) => ({ ...s, daily: e.target.value }))}
            />
          </label>
          <div className="full">
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input type="checkbox" checked disabled readOnly />
              Human approval required · cannot be disabled in this prototype
            </label>
            <div style={{ marginTop: 10 }}>
              <button className="btn" type="button" onClick={saveSettings}>Save guardrails locally</button>{' '}
              <button className="btn primary" type="submit">Validate draft</button>
            </div>
          </div>
        </form>
        <div className="catalog-note" style={{ margin: '12px 0 0' }} aria-live="polite">{result}</div>
        <p className="chart-footnote">Local draft queue: {draftCount} intent(s) stored in this browser. Drafts are never transmitted.</p>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head"><h2>Connection roadmap</h2></div>
          <div className="watchlist">
            <div className="market-row"><div><b>Telegram signal parser</b><div className="muted">Parse instrument, direction, entry, SL and TP</div></div><span className="tag neutral">Planned</span></div>
            <div className="market-row"><div><b>MetaTrader 5 demo</b><div className="muted">Validate order rules and execution logs</div></div><span className="tag neutral">Planned</span></div>
            <div className="market-row"><div><b>Risk guardrails</b><div className="muted">Maximum risk, daily loss limit, kill switch</div></div><span className="tag warn">Required</span></div>
            <div className="market-row"><div><b>Live execution</b><div className="muted">Only after extensive testing and review</div></div><span className="tag warn">Disabled</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Safety controls</h2></div>
          <div className="checkbox-stack">
            <label><input type="checkbox" /> Require confirmation before sending an order</label>
            <label><input type="checkbox" /> Enforce max risk per trade</label>
            <label><input type="checkbox" /> Enforce daily loss limit</label>
            <label><input type="checkbox" /> Reject duplicate or stale signals</label>
            <label><input type="checkbox" /> Log every signal and execution result</label>
          </div>
          <p className="muted" style={{ marginTop: 18, fontSize: 11.5 }}>These checkboxes are a planning aid only and do not control a trading account.</p>
        </div>
      </div>
    </>
  );
}

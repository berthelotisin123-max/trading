import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScreenshotPicker from '../components/ScreenshotPicker';
import { loadScreenshots, saveScreenshots } from '../lib/idb';
import { readJson, readString, writeJson, writeString } from '../lib/storage';
import { tradingViewUrl } from '../lib/instruments';
import { useToast } from '../context/ToastContext';

const ANALYSIS_DB = 'betzo-analysis-assets';
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'];
const CONFLUENCE_ITEMS = [
  { key: 'supplyDemand', label: 'Supply/demand zone identified and not invalidated' },
  { key: 'priceAction', label: 'Price action confirmation (displacement, rejection, or retest)' },
  { key: 'structure', label: 'SMC structure (BOS/CHoCH) aligns with plan' },
  { key: 'liquidity', label: 'Liquidity target or sweep is mapped (BSL/SSL, EQH/EQL)' },
  { key: 'ict', label: 'ICT context reviewed (premium/discount and session)' },
  { key: 'imbalance', label: 'FVG, order block, or mitigation evidence documented' },
] as const;
const CHECKLIST_ITEMS = [
  'Higher-timeframe bias identified',
  'Liquidity level marked',
  'Market structure shift confirmed',
  'Order block / FVG documented',
  'Stop-loss and invalidation defined',
  'Risk and news conditions reviewed',
] as const;

export default function Analysis() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // ----- Setup checklist (session-only, like the prototype) -----
  const [checklist, setChecklist] = useState<boolean[]>(() => CHECKLIST_ITEMS.map(() => false));

  // ----- Analysis notes -----
  const [notes, setNotes] = useState(() => readString('betzoAnalysis'));

  // ----- Setup planner -----
  const [savedPlan] = useState<Record<string, string>>(() => readJson<Record<string, string>>('betzoSetupPlan', {}));
  const [planResult, setPlanResult] = useState(
    'Manual review only. AI analysis is unavailable because no backend AI provider is configured. This check reports structure and arithmetic; it does not judge market direction or confirm a trade.',
  );

  // ----- Unified confluence review (controlled symbol/timeframe for chart handoff) -----
  const [symbol, setSymbol] = useState(() => searchParams.get('symbol') ?? 'EURUSD');
  const [timeframe, setTimeframe] = useState(() => searchParams.get('timeframe') ?? '15m');
  const [confluenceResult, setConfluenceResult] = useState(
    'Complete the checklist and verify current market data externally. This review cannot validate price action automatically.',
  );

  useEffect(() => {
    const paramSymbol = searchParams.get('symbol');
    const paramTf = searchParams.get('timeframe');
    if (paramSymbol) setSymbol(paramSymbol);
    if (paramTf && TIMEFRAMES.includes(paramTf)) setTimeframe(paramTf);
  }, [searchParams]);

  // ----- Screenshots -----
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotStatus, setScreenshotStatus] = useState(
    'Images stay in this browser. They are not uploaded or sent to an AI service.',
  );

  // Restore saved screenshots when the symbol changes.
  useEffect(() => {
    let cancelled = false;
    const record = readJson<{ screenshotKey?: string } | null>(`betzoConfluence_${symbol.toUpperCase()}`, null);
    if (!record?.screenshotKey) {
      setScreenshotFiles([]);
      return undefined;
    }
    loadScreenshots(ANALYSIS_DB, record.screenshotKey)
      .then((files) => {
        if (cancelled) return;
        setScreenshotFiles(files.map((f) => new File([f.blob], f.name, { type: f.type })));
        setScreenshotStatus(`${files.length} saved screenshot(s) restored from this browser.`);
      })
      .catch(() => {
        if (!cancelled) setScreenshotStatus('Saved screenshots could not be restored in this browser.');
      });
    return () => { cancelled = true; };
  }, [symbol]);

  // ----- AI availability -----
  const [aiMessage, setAiMessage] = useState('No screenshot or trade plan has been sent to an AI provider.');

  const handleSaveNotes = () => {
    writeString('betzoAnalysis', notes);
    toast('Analysis notes saved locally.');
  };

  const handleSetupReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const entry = Number(data.entry);
    const stop = Number(data.stop);
    const target = Number(data.target);
    const isLong = data.direction === 'BUY';
    const valid = isLong ? stop < entry && target > entry : stop > entry && target < entry;

    if (!String(data.symbol ?? '').trim() || !String(data.thesis ?? '').trim() || ![entry, stop, target].every(Number.isFinite) || !valid) {
      setPlanResult('Plan is incomplete: enter a symbol, thesis, and numeric entry/stop/target levels on the correct sides for the chosen direction. No trade signal was produced.');
      return;
    }
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    setPlanResult(
      `Plan structure check passed. ${String(data.symbol).toUpperCase()} ${data.direction}; stop distance ${risk.toFixed(5)}, target distance ${reward.toFixed(5)}, planned reward/risk ${(reward / risk).toFixed(2)}:1. Basis: ${data.basis}. This is arithmetic only; it does not validate data, strategy edge, or suitability.`,
    );
  };

  const handleConfluenceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const entry = Number(data.entry);
    const stop = Number(data.stop);
    const target = Number(data.target);
    const riskPct = Number(data.riskPct);
    const isLong = data.direction === 'BUY';
    const validLevels = isLong ? stop < entry && target > entry : stop > entry && target < entry;
    const checks = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="confluence"]'));
    const score = checks.filter((c) => c.checked).length;
    const dataChecked = form.elements.namedItem('externalDataChecked') instanceof HTMLInputElement
      && (form.elements.namedItem('externalDataChecked') as HTMLInputElement).checked;
    const validRisk = Number.isFinite(riskPct) && riskPct > 0 && riskPct <= 2;

    if (!validLevels || !validRisk) {
      setConfluenceResult('Review blocked: check that stop and target are on the correct sides of entry and risk is above 0% and no more than the preview limit of 2%. No setup was approved.');
      return;
    }
    const thresholdMet = score >= 5 && dataChecked;
    const status = thresholdMet
      ? 'Checklist threshold met on your manual evidence and data attestation.'
      : 'Insufficient evidence for the review threshold, or current external data has not been confirmed.';
    setConfluenceResult(
      `${status} ${symbol.toUpperCase()} | ${timeframe} | ${data.direction} | confluence ${score}/6 | planned risk ${riskPct}%. This is a transparent checklist result — not a verified, trusted, AI-generated, or live trading signal. The price bars are illustrative and the checked evidence is user-reported.`,
    );
  };

  const handleConfluenceSave = async () => {
    const form = document.getElementById('confluenceForm') as HTMLFormElement | null;
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const checks = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="confluence"]'))
      .map((c) => ({ key: c.value, checked: c.checked }));
    const key = symbol.toUpperCase();
    const record: Record<string, unknown> = {
      ...data,
      symbol: key,
      timeframe,
      checks,
      savedAt: new Date().toISOString(),
      status: 'manual-review-only',
    };

    if (screenshotFiles.length > 0) {
      const screenshotKey = `screenshots-${key}-${Date.now()}`;
      try {
        await saveScreenshots(ANALYSIS_DB, screenshotKey, screenshotFiles);
        record.screenshotKey = screenshotKey;
        record.screenshotNames = screenshotFiles.map((f) => f.name);
        setScreenshotStatus('Analysis screenshots saved locally in this browser. They were not uploaded or sent to AI.');
      } catch {
        setScreenshotStatus('Image preview works, but this browser could not save the screenshot files.');
      }
    }

    writeJson(`betzoConfluence_${key}`, record);
    toast('Confluence notes saved locally; no signal or order created.');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Research workspace</div>
          <h1>Confluence analysis</h1>
          <p>Combine supply and demand, price action, Smart Money Concepts, ICT context, and risk checks in one review.</p>
        </div>
        <a className="btn icon-link" href={tradingViewUrl(symbol)} target="_blank" rel="noopener noreferrer">
          ↗ Verify symbol on TradingView
        </a>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head"><h2>Setup checklist</h2><span className="tag neutral">Manual research</span></div>
          <div className="checklist">
            {CHECKLIST_ITEMS.map((item, i) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checklist[i]}
                  onChange={() => setChecklist((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                />
                {item}
              </label>
            ))}
          </div>
          <button className="btn" type="button" style={{ marginTop: 18 }} onClick={() => setChecklist(CHECKLIST_ITEMS.map(() => false))}>
            Reset checklist
          </button>
        </div>

        <div className="card">
          <div className="card-head"><h2>Analysis notes</h2><span className="pill">Local draft</span></div>
          <label className="muted" htmlFor="analysisNotes">Instrument, timeframe, bias, liquidity, confirmation, invalidation</label>
          <textarea
            id="analysisNotes"
            rows={10}
            style={{ width: '100%', marginTop: 10 }}
            placeholder="Example: XAUUSD · 15M bias…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <button className="btn primary" type="button" style={{ marginTop: 10 }} onClick={handleSaveNotes}>
            Save notes locally
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-head">
          <div>
            <h2>Trade setup planner</h2>
            <p>Manual plan review · no signal or order is generated</p>
          </div>
          <span className="tag neutral">Local only</span>
        </div>
        <form
          className="form-grid"
          onSubmit={handleSetupReview}
        >
          <label>Instrument<input name="symbol" defaultValue={savedPlan.symbol ?? ''} placeholder="e.g. EURUSD" required /></label>
          <label>Direction
            <select name="direction" defaultValue={savedPlan.direction ?? 'BUY'}>
              <option value="BUY">Long / Buy</option>
              <option value="SELL">Short / Sell</option>
            </select>
          </label>
          <label>Entry<input name="entry" type="number" step="any" defaultValue={savedPlan.entry ?? ''} required /></label>
          <label>Stop / invalidation<input name="stop" type="number" step="any" defaultValue={savedPlan.stop ?? ''} required /></label>
          <label>Target<input name="target" type="number" step="any" defaultValue={savedPlan.target ?? ''} required /></label>
          <label>Data basis
            <select name="basis" defaultValue={savedPlan.basis ?? 'Illustrative demo chart'}>
              <option>Illustrative demo chart</option>
              <option>User-entered prices</option>
              <option>Verified external data</option>
            </select>
          </label>
          <label className="full">Thesis and confirmation
            <textarea name="thesis" rows={3} defaultValue={savedPlan.thesis ?? ''} placeholder="Record timeframe, context, confirmation, and what would invalidate this idea." required />
          </label>
          <div className="full">
            <button className="btn" type="button" onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).closest('form');
              if (form) {
                writeJson('betzoSetupPlan', Object.fromEntries(new FormData(form).entries()));
                toast('Setup plan saved in this browser.');
              }
            }}>
              Save plan locally
            </button>{' '}
            <button className="btn primary" type="submit">Review plan structure</button>
          </div>
        </form>
        <div className="catalog-note" style={{ margin: '12px 0 0' }} aria-live="polite">{planResult}</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h2>Unified confluence review</h2>
            <p>Supply &amp; demand + price action + SMC + ICT + risk</p>
          </div>
          <span className="tag warn">Evidence checklist · not a signal</span>
        </div>
        <form id="confluenceForm" className="form-grid" onSubmit={handleConfluenceSubmit}>
          <label>Instrument<input name="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} required /></label>
          <label>Analysis timeframe
            <select name="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </label>
          <label>Directional plan
            <select name="direction" defaultValue="BUY">
              <option value="BUY">Long / Buy</option>
              <option value="SELL">Short / Sell</option>
            </select>
          </label>
          <label>Risk per trade (%)<input name="riskPct" type="number" min="0.01" max="2" step="0.01" defaultValue="1" required /></label>
          <label>Entry price<input name="entry" type="number" step="any" required /></label>
          <label>Stop / invalidation<input name="stop" type="number" step="any" required /></label>
          <label>Target price<input name="target" type="number" step="any" required /></label>
          <div className="full password-rules" style={{ gridTemplateColumns: '1fr' }}>
            {CONFLUENCE_ITEMS.map((item) => (
              <label key={item.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input type="checkbox" name="confluence" value={item.key} />
                {item.label}
              </label>
            ))}
          </div>
          <label className="full" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <input type="checkbox" name="externalDataChecked" required />
            I checked this symbol and timeframe on a current, trusted chart/data source. BETZO itself has no live feed.
          </label>
          <div className="full">
            <button className="btn primary" type="submit">Review confluence</button>{' '}
            <button className="btn" type="button" onClick={handleConfluenceSave}>Save review locally</button>
          </div>
        </form>
        <div className="catalog-note" style={{ margin: '12px 0 0' }} aria-live="polite">{confluenceResult}</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h2>▧ Setup screenshots</h2>
            <p>Attach chart evidence to your local analysis record.</p>
          </div>
          <span className="tag neutral">Browser only</span>
        </div>
        <ScreenshotPicker
          label="Screenshots (PNG, JPG, or WebP; max 4 files, 8 MB each)"
          files={screenshotFiles}
          onChange={(files, message) => {
            setScreenshotFiles(files);
            setScreenshotStatus(message ?? `${files.length} screenshot(s) attached. Save the analysis to keep them in this browser.`);
          }}
          status={screenshotStatus}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h2>✦ AI setup analysis</h2>
            <p>Source-aware review of screenshots, chart context, and your trade thesis.</p>
          </div>
          <span className="tag warn">Service unavailable</span>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          No secure BETZO AI backend or licensed live data feed is connected. This prototype cannot analyze
          screenshots with AI or confirm a trusted setup.
        </p>
        <button className="btn" type="button" onClick={() => setAiMessage('AI review is not configured. No analysis was run and no files left this browser.')}>
          <span aria-hidden="true">✦</span> Check AI availability
        </button>
        <p className="auth-message" aria-live="polite">{aiMessage}</p>
      </div>

      <div className="callout">
        <div className="callout-icon" aria-hidden="true">!</div>
        <div>
          <h3>Analysis is not a guarantee</h3>
          <p>This workspace checks documented confluence only. No live feed, automated pattern detector, or AI service is connected; do not treat this review as a verified signal.</p>
        </div>
      </div>
    </>
  );
}

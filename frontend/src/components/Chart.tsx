import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { bollinger, ema, illustrativeRsi14, makeDemoBars, sma } from '../lib/demoBars';
import { readJson, removeKey, writeJson } from '../lib/storage';
import { useToast } from '../context/ToastContext';

export const CHART_TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'] as const;
export type ChartTimeframe = (typeof CHART_TIMEFRAMES)[number];

type ChartKind = 'candle' | 'line';
type IndicatorKey = 'sma20' | 'ema9' | 'bb20' | 'rsi14';

export type ChartDrawing =
  | { type: 'fib'; high: number; low: number }
  | { type: 'position'; direction: 'BUY' | 'SELL'; entry: number; stop: number; target: number; rr: number }
  | { type: 'zone'; side: 'SUPPLY' | 'DEMAND'; high: number; low: number }
  | { type: 'trend'; start: number; end: number };

interface ChartProps {
  symbol: string;
  /** 'overview' and 'charts' persist drawings under separate keys. */
  persistId: 'overview' | 'charts';
  compact?: boolean;
  onAnalyze?: (symbol: string, interval: ChartTimeframe) => void;
}

const W = 900;
const H = 300;
const L = 18;
const R = 58;
const T = 14;
const B = 26;
const PW = W - L - R;
const PH = H - T - B;
const BAR_COUNT = 36;

function drawingKey(persistId: string, symbol: string, interval: string): string {
  return `betzoChartDrawing_${persistId}_${symbol}_${interval}`;
}
function levelsKey(persistId: string, symbol: string, interval: string): string {
  return `betzoChartLevels_${persistId}_${symbol}_${interval}`;
}

export default function Chart({ symbol, persistId, compact = false, onAnalyze }: ChartProps) {
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [interval, setInterval] = useState<ChartTimeframe>('15m');
  const [kind, setKind] = useState<ChartKind>('candle');
  const [indicators, setIndicators] = useState<Record<IndicatorKey, boolean>>({
    sma20: false,
    ema9: false,
    bb20: false,
    rsi14: false,
  });
  const [levels, setLevels] = useState<number[]>([]);
  const [drawing, setDrawing] = useState<ChartDrawing | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

  // Reload persisted drawings whenever the context changes.
  useEffect(() => {
    setLevels(readJson<number[]>(levelsKey(persistId, symbol, interval), []).filter(Number.isFinite));
    setDrawing(readJson<ChartDrawing | null>(drawingKey(persistId, symbol, interval), null));
  }, [persistId, symbol, interval]);

  const bars = useMemo(() => makeDemoBars(symbol + interval), [symbol, interval]);
  const lo = Math.min(...bars.map((b) => b.low)) - 0.5;
  const hi = Math.max(...bars.map((b) => b.high)) + 0.5;
  const y = useCallback((v: number) => T + ((hi - v) / (hi - lo)) * PH, [hi, lo]);
  const x = useCallback((i: number) => L + ((i + 0.5) * PW) / BAR_COUNT, []);

  const toggleIndicator = (key: IndicatorKey) =>
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));

  const persistLevels = (next: number[]) => {
    setLevels(next);
    writeJson(levelsKey(persistId, symbol, interval), next);
  };
  const persistDrawing = (next: ChartDrawing | null) => {
    setDrawing(next);
    if (next) writeJson(drawingKey(persistId, symbol, interval), next);
    else removeKey(drawingKey(persistId, symbol, interval));
  };

  const handleAddLevel = () => {
    const value = Number(window.prompt('Add a horizontal level in the illustrative chart units shown on this demo chart:'));
    if (!Number.isFinite(value)) return;
    persistLevels([...levels, value]);
    toast('Illustrative analysis level saved locally.');
  };

  const handleAlertDraft = () => {
    const value = Number(window.prompt('Price threshold for a local alert draft (no feed will trigger it):'));
    if (!Number.isFinite(value)) return;
    writeJson(`betzoAlertDraft_${symbol}`, {
      symbol,
      threshold: value,
      createdAt: new Date().toISOString(),
      status: 'draft-only-no-live-feed',
    });
    toast('Alert draft saved locally; no monitoring is active.');
  };

  const handleSaveSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'betzo-chart-illustration.svg';
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Illustrative chart SVG downloaded.');
  };

  const handleFib = () => {
    const highRaw = window.prompt('Swing high in illustrative chart units:');
    if (highRaw === null) return;
    const lowRaw = window.prompt('Swing low in illustrative chart units:');
    if (lowRaw === null) return;
    const high = Number(highRaw);
    const low = Number(lowRaw);
    if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
      toast('Enter a numeric swing high above the swing low.');
      return;
    }
    persistDrawing({ type: 'fib', high, low });
    toast('Fibonacci retracement levels saved locally.');
  };

  const handlePosition = () => {
    const directionRaw = window.prompt('Plan direction: type BUY or SELL');
    if (!directionRaw) return;
    const entryRaw = window.prompt('Planned entry in illustrative chart units:');
    if (entryRaw === null) return;
    const stopRaw = window.prompt('Stop / invalidation in illustrative chart units:');
    if (stopRaw === null) return;
    const targetRaw = window.prompt('Target in illustrative chart units:');
    if (targetRaw === null) return;
    const entry = Number(entryRaw);
    const stop = Number(stopRaw);
    const target = Number(targetRaw);
    const side = directionRaw.trim().toUpperCase();
    const valid =
      (side === 'BUY' && stop < entry && target > entry) ||
      (side === 'SELL' && stop > entry && target < entry);
    if (![entry, stop, target].every(Number.isFinite) || !valid) {
      toast('Plan levels are invalid for that direction. Nothing was saved.');
      return;
    }
    const rr = Math.abs(target - entry) / Math.abs(entry - stop);
    persistDrawing({ type: 'position', direction: side as 'BUY' | 'SELL', entry, stop, target, rr });
    toast('Manual position plan drawn locally; no order was sent.');
  };

  const handleZone = () => {
    const side = (window.prompt('Zone type: SUPPLY or DEMAND') ?? '').trim().toUpperCase();
    if (side !== 'SUPPLY' && side !== 'DEMAND') return;
    const high = Number(window.prompt('Zone upper price:'));
    const low = Number(window.prompt('Zone lower price:'));
    if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
      toast('Enter a valid supply or demand range.');
      return;
    }
    persistDrawing({ type: 'zone', side, high, low });
    toast('Supply/demand zone saved locally.');
  };

  const handleTrend = () => {
    const start = Number(window.prompt('Trendline start price:'));
    if (!Number.isFinite(start)) return;
    const end = Number(window.prompt('Trendline end price:'));
    if (!Number.isFinite(end)) return;
    persistDrawing({ type: 'trend', start, end });
    toast('Trendline saved locally.');
  };

  const handleClear = () => {
    removeKey(drawingKey(persistId, symbol, interval));
    removeKey(levelsKey(persistId, symbol, interval));
    setDrawing(null);
    setLevels([]);
    toast('Local drawings cleared for this chart interval.');
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const py = ((event.clientY - rect.top) / rect.height) * H;
    if (px < L || px > W - R || py < T || py > T + PH) {
      setCrosshair(null);
      return;
    }
    setCrosshair({ x: px, y: py });
  };

  const smaValues = indicators.sma20 ? sma(bars, 20) : null;
  const emaValues = indicators.ema9 ? ema(bars, 9) : null;
  const bbValues = indicators.bb20 ? bollinger(bars, 20, 2) : null;
  const rsiValue = indicators.rsi14 ? illustrativeRsi14(bars) : null;
  const crosshairPrice = crosshair ? hi - ((crosshair.y - T) / PH) * (hi - lo) : null;

  const polyline = (points: Array<string>) => points.join(' ');

  return (
    <div>
      <div className="chart-toolbar" aria-label="Chart controls">
        <div className="chart-tool-group" role="group" aria-label="Interval">
          <span className="chart-tool-label">Interval</span>
          {CHART_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              className={`chart-tool-btn${interval === tf ? ' active' : ''}`}
              aria-pressed={interval === tf}
              onClick={() => setInterval(tf as ChartTimeframe)}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="chart-tool-group" role="group" aria-label="Style and indicators">
          <span className="chart-tool-label">Style</span>
          <button type="button" className={`chart-tool-btn${kind === 'candle' ? ' active' : ''}`} aria-pressed={kind === 'candle'} onClick={() => setKind('candle')}>Candles</button>
          <button type="button" className={`chart-tool-btn${kind === 'line' ? ' active' : ''}`} aria-pressed={kind === 'line'} onClick={() => setKind('line')}>Line</button>
          <button type="button" className={`chart-tool-btn${indicators.sma20 ? ' active' : ''}`} aria-pressed={indicators.sma20} onClick={() => toggleIndicator('sma20')}>SMA 20</button>
          <button type="button" className={`chart-tool-btn${indicators.ema9 ? ' active' : ''}`} aria-pressed={indicators.ema9} onClick={() => toggleIndicator('ema9')}>EMA 9</button>
          <button type="button" className={`chart-tool-btn${indicators.bb20 ? ' active' : ''}`} aria-pressed={indicators.bb20} onClick={() => toggleIndicator('bb20')}>Bollinger 20</button>
          <button type="button" className={`chart-tool-btn${indicators.rsi14 ? ' active' : ''}`} aria-pressed={indicators.rsi14} onClick={() => toggleIndicator('rsi14')}>RSI 14</button>
        </div>
        <div className="chart-tool-group" role="group" aria-label="Tools">
          <button type="button" className="chart-tool-btn" onClick={handleAddLevel}>+ Price level</button>
          <button type="button" className="chart-tool-btn" onClick={handleFib}>Fibonacci</button>
          <button type="button" className="chart-tool-btn" onClick={handlePosition}>Long/short plan</button>
          <button type="button" className="chart-tool-btn" onClick={handleZone}>Supply/demand zone</button>
          <button type="button" className="chart-tool-btn" onClick={handleTrend}>Trendline</button>
          <button type="button" className="chart-tool-btn" onClick={handleClear}>Clear drawings</button>
          <button type="button" className="chart-tool-btn" onClick={handleSaveSvg}>Save SVG</button>
          <button type="button" className="chart-tool-btn" onClick={handleAlertDraft}>Alert draft</button>
          {onAnalyze && (
            <button type="button" className="btn primary" onClick={() => onAnalyze(symbol, interval)}>
              Analyze this chart
            </button>
          )}
        </div>
      </div>

      <div className={compact ? 'chart-wrap' : 'chart-frame'}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Illustrative ${kind === 'candle' ? 'candlestick' : 'line'} chart for ${symbol} at ${interval}`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setCrosshair(null)}
        >
          <g stroke="#253143" strokeWidth="1">
            {Array.from({ length: 5 }, (_, i) => {
              const yy = T + (i * PH) / 4;
              const val = hi - (i * (hi - lo)) / 4;
              return (
                <g key={i}>
                  <path d={`M${L} ${yy}H${W - R}`} />
                  <text x={W - R + 8} y={yy + 4} fill="#8392a8" stroke="none" fontSize="11">
                    {val.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>

          {kind === 'candle' ? (
            bars.map((bar, i) => {
              const xx = x(i);
              const up = bar.close >= bar.open;
              const color = up ? '#4f9cff' : '#ff647c';
              const cw = Math.max(4, (PW / BAR_COUNT) * 0.55);
              const yy = Math.min(y(bar.open), y(bar.close));
              const bh = Math.max(1, Math.abs(y(bar.open) - y(bar.close)));
              return (
                <g key={i}>
                  <title>{`Sample bar ${i + 1} · O ${bar.open.toFixed(2)} H ${bar.high.toFixed(2)} L ${bar.low.toFixed(2)} C ${bar.close.toFixed(2)}`}</title>
                  <path d={`M${xx} ${y(bar.high)}V${y(bar.low)}`} stroke={color} strokeWidth="1.4" />
                  <rect x={xx - cw / 2} y={yy} width={cw} height={bh} fill={color} rx="1" />
                </g>
              );
            })
          ) : (
            <polyline
              points={polyline(bars.map((b, i) => `${x(i)},${y(b.close)}`))}
              fill="none"
              stroke="#4f9cff"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {smaValues && (
            <polyline
              points={polyline(smaValues.map((v, i) => (v === null ? null : `${x(i)},${y(v)}`)).filter((p): p is string => p !== null))}
              fill="none"
              stroke="#f4c66a"
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            >
              <title>Illustrative SMA 20</title>
            </polyline>
          )}
          {emaValues && (
            <polyline
              points={polyline(emaValues.map((v, i) => `${x(i)},${y(v)}`))}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            >
              <title>Illustrative EMA 9</title>
            </polyline>
          )}
          {bbValues && (
            <>
              <polyline
                points={polyline(bbValues.map((v, i) => (v === null ? null : `${x(i)},${y(v.upper)}`)).filter((p): p is string => p !== null))}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.4"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              >
                <title>Illustrative Bollinger 20 upper</title>
              </polyline>
              <polyline
                points={polyline(bbValues.map((v, i) => (v === null ? null : `${x(i)},${y(v.lower)}`)).filter((p): p is string => p !== null))}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.4"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              >
                <title>Illustrative Bollinger 20 lower</title>
              </polyline>
            </>
          )}
          {rsiValue !== null && (
            <text x={L + 8} y={T + 15} fill="#c084fc" fontSize="11">
              {`Illustrative RSI 14: ${rsiValue.toFixed(1)}`}
            </text>
          )}

          {levels.filter((v) => v >= lo && v <= hi).map((level, i) => (
            <g key={`level-${i}`}>
              <title>{`Saved manual level ${level.toFixed(2)}`}</title>
              <path d={`M${L} ${y(level)}H${W - R}`} stroke="#f4c66a" strokeDasharray="5 4" />
              <text x={L + 4} y={y(level) - 4} fill="#f4c66a" fontSize="10">
                {`L${i + 1} ${level.toFixed(2)}`}
              </text>
            </g>
          ))}

          {drawing?.type === 'fib' &&
            [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map((ratio) => {
              const value = drawing.high - (drawing.high - drawing.low) * ratio;
              if (value < lo || value > hi) return null;
              const pct = Math.round(ratio * 1000) / 10;
              return (
                <g key={ratio}>
                  <title>{`Illustrative Fibonacci level ${pct}%`}</title>
                  <path d={`M${L} ${y(value)}H${W - R}`} stroke="#c084fc" strokeDasharray="3 4" />
                  <text x={L + 4} y={y(value) - 4} fill="#c084fc" fontSize="9">
                    {`${pct}% ${value.toFixed(2)}`}
                  </text>
                </g>
              );
            })}
          {drawing?.type === 'position' &&
            ([
              [drawing.entry, 'ENTRY', '#edf3fb'],
              [drawing.stop, 'STOP', '#ff647c'],
              [drawing.target, 'TARGET', '#4f9cff'],
            ] as Array<[number, string, string]>).map(([value, label, color]) => {
              if (value < lo || value > hi) return null;
              return (
                <g key={label}>
                  <title>{`${label} ${value.toFixed(2)}`}</title>
                  <path d={`M${L} ${y(value)}H${W - R}`} stroke={color} strokeDasharray="6 4" />
                  <text x={L + 4} y={y(value) - 4} fill={color} fontSize="9">
                    {`${label} ${value.toFixed(2)}`}
                  </text>
                </g>
              );
            })}
          {drawing?.type === 'zone' &&
            (() => {
              const top = Math.max(T, Math.min(y(drawing.high), y(drawing.low)));
              const bottom = Math.min(T + PH, Math.max(y(drawing.high), y(drawing.low)));
              if (bottom <= top) return null;
              const color = drawing.side === 'SUPPLY' ? '#ff647c' : '#4f9cff';
              return (
                <g>
                  <title>{`${drawing.side} zone ${drawing.low}–${drawing.high}`}</title>
                  <rect x={L} y={top} width={PW} height={bottom - top} fill={color} fillOpacity="0.12" stroke={color} strokeDasharray="5 4" />
                </g>
              );
            })()}
          {drawing?.type === 'trend' && (
            <g>
              <title>{`Trendline ${drawing.start} → ${drawing.end}`}</title>
              <line x1={L} y1={y(drawing.start)} x2={W - R} y2={y(drawing.end)} stroke="#f4c66a" strokeDasharray="6 4" strokeWidth="1.4" />
            </g>
          )}

          {crosshair && (
            <g pointerEvents="none">
              <line x1={crosshair.x} x2={crosshair.x} y1={T} y2={T + PH} stroke="#9bb4d6" strokeDasharray="3 3" />
              <line x1={L} x2={W - R} y1={crosshair.y} y2={crosshair.y} stroke="#9bb4d6" strokeDasharray="3 3" />
              <text x={L + 4} y={crosshair.y - 5} fill="#9bb4d6" fontSize="10">
                {crosshairPrice?.toFixed(2)}
              </text>
            </g>
          )}

          <g fill="#718198" fontSize="10">
            <text x={L} y={H - 7}>older bars</text>
            <text x={W - R - 45} y={H - 7}>newer bars</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

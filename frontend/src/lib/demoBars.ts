/** Deterministic illustrative OHLC bars — NOT market data. */

export interface DemoBar {
  open: number;
  high: number;
  low: number;
  close: number;
}

export function makeDemoBars(seed: string): DemoBar[] {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  let prev = 100 + (hash % 19);
  return Array.from({ length: 36 }, (_, i) => {
    const wave = Math.sin((i + (hash % 11)) * 1.17) * 1.45 + Math.cos(i * 0.41) * 0.7;
    const open = prev;
    const close = 100 + (hash % 13) * 0.22 + i * 0.045 + wave;
    const high = Math.max(open, close) + 0.25 + ((i + hash) % 4) * 0.09;
    const low = Math.min(open, close) - 0.22 + ((i + hash) % 3) * 0.08;
    prev = close;
    return { open, high, low, close };
  });
}

export function sma(bars: DemoBar[], period: number): Array<number | null> {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((sum, b) => sum + b.close, 0) / period;
  });
}

export function ema(bars: DemoBar[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [bars[0]?.close ?? 0];
  for (let i = 1; i < bars.length; i += 1) {
    out.push(bars[i].close * k + out[i - 1] * (1 - k));
  }
  return out;
}

export function bollinger(bars: DemoBar[], period = 20, multiplier = 2): Array<{ upper: number; lower: number } | null> {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const window = bars.slice(i - period + 1, i + 1);
    const mean = window.reduce((sum, b) => sum + b.close, 0) / period;
    const variance = window.reduce((sum, b) => sum + (b.close - mean) ** 2, 0) / period;
    const deviation = Math.sqrt(variance);
    return { upper: mean + multiplier * deviation, lower: mean - multiplier * deviation };
  });
}

/** Simplified illustrative RSI 14 over the most recent 15 closes. */
export function illustrativeRsi14(bars: DemoBar[]): number {
  const recent = bars.slice(-15);
  const changes = recent.slice(1).map((bar, i) => bar.close - recent[i].close);
  const gain = changes.reduce((sum, v) => sum + Math.max(v, 0), 0) / 14;
  const loss = changes.reduce((sum, v) => sum + Math.max(-v, 0), 0) / 14;
  return loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
}

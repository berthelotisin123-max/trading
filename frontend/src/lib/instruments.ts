/**
 * Static multi-asset reference catalogue.
 *
 * Symbols are examples collected from public market-category pages (Forex
 * Factory's forex market guide, TradingView market categories, and Weltrade's
 * instrument overview / SyntX guide). They are reference metadata only: no
 * prices, no broker availability, no live feed. A CFD is price exposure, not
 * ownership of the underlying asset.
 */

export type AssetCategory =
  | 'Forex'
  | 'Metals'
  | 'Energy'
  | 'Stock Indices'
  | 'Stocks'
  | 'ETFs'
  | 'Bonds'
  | 'Crypto'
  | 'Agriculture'
  | 'Synthetic Indices'
  | 'Derivatives'
  | 'Money Markets'
  | 'REITs';

export interface Instrument {
  symbol: string;
  category: AssetCategory;
  reference: string;
  source: string;
}

const forexFactoryPairs =
  'USD/CAD USD/CHF USD/CNY USD/HKD USD/INR USD/JPY USD/MXN USD/NOK USD/PLN USD/RUB USD/SEK USD/SGD USD/THB USD/TRY USD/ZAR EUR/AUD EUR/CAD EUR/CHF EUR/GBP EUR/JPY EUR/NZD EUR/USD GBP/AUD GBP/CAD GBP/CHF GBP/JPY GBP/NZD GBP/USD AUD/CAD AUD/CHF AUD/JPY AUD/NZD AUD/USD NZD/CAD NZD/CHF NZD/JPY NZD/USD CAD/CHF CAD/JPY CHF/JPY'.split(
    ' ',
  );

const catalogueSeed: Array<[string, AssetCategory, string, string]> = [
  ...forexFactoryPairs.map(
    (pair): [string, AssetCategory, string, string] => [
      pair.replace('/', ''),
      'Forex',
      'Spot currency pair',
      'Forex Factory · market instrument example',
    ],
  ),
  ['EURUSD', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['USDJPY', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['GBPUSD', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['AUDUSD', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['USDCAD', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['USDCHF', 'Forex', 'Major currency pair', 'TradingView · majors'],
  ['XAUUSD', 'Metals', 'Gold · spot/CFD contract varies', 'Weltrade · XAU/USD example'],
  ['XAUEUR', 'Metals', 'Gold · contract varies', 'Weltrade · XAU/EUR example'],
  ['XAGUSD', 'Metals', 'Silver · spot/CFD contract varies', 'Weltrade · XAG/USD example'],
  ['GC1!', 'Metals', 'Gold futures continuous symbol', 'TradingView · futures category'],
  ['SI1!', 'Metals', 'Silver futures continuous symbol', 'TradingView · futures category'],
  ['HG1!', 'Metals', 'Copper futures continuous symbol', 'TradingView · futures category'],
  ['PL1!', 'Metals', 'Platinum futures continuous symbol', 'TradingView · futures category'],
  ['PA1!', 'Metals', 'Palladium futures continuous symbol', 'TradingView · futures category'],
  ['UKOIL', 'Energy', 'Brent oil · broker contract varies', 'Weltrade · commodity example'],
  ['USOIL', 'Energy', 'WTI oil · broker contract varies', 'Weltrade · commodity example'],
  ['NGAS', 'Energy', 'Natural gas · broker contract varies', 'Weltrade · commodity example'],
  ['RB1!', 'Energy', 'RBOB gasoline futures', 'TradingView · futures category'],
  ['HO1!', 'Energy', 'NY Harbor ULSD futures', 'TradingView · futures category'],
  ['NDXUSD', 'Stock Indices', 'Nasdaq 100 · broker symbol example', 'Weltrade · index example'],
  ['SPXUSD', 'Stock Indices', 'S&P 500 · broker symbol example', 'Weltrade · index example'],
  ['DJIUSD', 'Stock Indices', 'Dow Jones · broker symbol example', 'Weltrade · index example'],
  ['US500', 'Stock Indices', 'S&P 500 · regional symbol varies', 'Weltrade · index example'],
  ['USTEC', 'Stock Indices', 'Nasdaq · regional symbol varies', 'Weltrade · index example'],
  ['GER40', 'Stock Indices', 'DAX 40 · regional symbol varies', 'Weltrade · index example'],
  ['JP225', 'Stock Indices', 'Nikkei · regional symbol varies', 'Weltrade · index example'],
  ['NQ1!', 'Stock Indices', 'E-mini Nasdaq-100 futures', 'TradingView · futures category'],
  ['ES1!', 'Stock Indices', 'E-mini S&P 500 futures', 'TradingView · futures category'],
  ['YM1!', 'Stock Indices', 'E-mini Dow futures', 'TradingView · futures category'],
  ['RTY1!', 'Stock Indices', 'E-mini Russell 2000 futures', 'TradingView · futures category'],
  ['DXY', 'Forex', 'US Dollar currency index', 'TradingView · currency index'],
  ['AAPL', 'Stocks', 'Apple · equity / CFD availability varies', 'Weltrade · share example'],
  ['MSFT', 'Stocks', 'Microsoft · equity / CFD availability varies', 'Weltrade · share example'],
  ['AMZN', 'Stocks', 'Amazon · equity / CFD availability varies', 'Weltrade · share example'],
  ['TSLA', 'Stocks', 'Tesla · equity / CFD availability varies', 'Weltrade · share example'],
  ['META', 'Stocks', 'Meta · equity / CFD availability varies', 'Weltrade · share example'],
  ['GOOGL', 'Stocks', 'Alphabet · equity / CFD availability varies', 'Weltrade · share example'],
  ['NVDA', 'Stocks', 'NVIDIA · listed equity', 'TradingView · world stocks'],
  ['SPY', 'ETFs', 'SPDR S&P 500 ETF · exchange listing varies', 'TradingView · ETF category'],
  ['QQQ', 'ETFs', 'Nasdaq-100 ETF · exchange listing varies', 'TradingView · ETF category'],
  ['US01Y', 'Bonds', 'US 1-year government bond reference', 'TradingView · bonds'],
  ['US02Y', 'Bonds', 'US 2-year government bond reference', 'TradingView · bonds'],
  ['US10Y', 'Bonds', 'US 10-year government bond reference', 'TradingView · bonds'],
  ['GB10Y', 'Bonds', 'UK 10-year government bond reference', 'TradingView · bonds'],
  ['DE10Y', 'Bonds', 'Germany 10-year government bond reference', 'TradingView · bonds'],
  ['BTCUSD', 'Crypto', 'Bitcoin · venue-specific spot/derivative', 'TradingView · crypto markets'],
  ['ETHUSD', 'Crypto', 'Ethereum · venue-specific spot/derivative', 'TradingView · crypto markets'],
  ['SOLUSDT', 'Crypto', 'Solana / Tether · venue-specific pair', 'TradingView · crypto markets'],
  ['XRPUSD', 'Crypto', 'XRP · venue-specific spot/derivative', 'TradingView · crypto markets'],
  ['BNBUSD', 'Crypto', 'BNB · venue-specific spot/derivative', 'TradingView · crypto markets'],
  ['KC1!', 'Agriculture', 'Coffee futures continuous symbol', 'TradingView · futures category'],
  ['CT1!', 'Agriculture', 'Cotton futures continuous symbol', 'TradingView · futures category'],
  ['ZS1!', 'Agriculture', 'Soybean futures continuous symbol', 'TradingView · futures category'],
  ['ZW1!', 'Agriculture', 'Wheat futures continuous symbol', 'TradingView · futures category'],
  ['SB1!', 'Agriculture', 'Sugar futures continuous symbol', 'TradingView · futures category'],
  ['ZC1!', 'Agriculture', 'Corn futures continuous symbol', 'TradingView · futures category'],
  ['Crash Index', 'Synthetic Indices', 'Provider-specific synthetic product; verify exact symbol', 'Weltrade · SyntX examples vary'],
  ['Boom Index', 'Synthetic Indices', 'Provider-specific synthetic product; verify exact symbol', 'Weltrade · SyntX examples vary'],
  ['Volatility Index', 'Synthetic Indices', 'Provider-specific synthetic product; not universal', 'BETZO category · provider-specific'],
  ['FX Vol. 20–99', 'Synthetic Indices', 'Synthetic volatility family; verify exact variants', 'Weltrade · SyntX guide'],
  ['SFX Vol. 20–99', 'Synthetic Indices', 'Volatility family with simulated spikes; verify variants', 'Weltrade · SyntX guide'],
  ...['400', '600', '800', '999', '1200'].map(
    (n): [string, AssetCategory, string, string] => [
      `PainX ${n}`,
      'Synthetic Indices',
      'PainX tick-interval family; broker terms apply',
      'Weltrade · SyntX guide',
    ],
  ),
  ...['400', '600', '800', '999', '1200'].map(
    (n): [string, AssetCategory, string, string] => [
      `GainX ${n}`,
      'Synthetic Indices',
      'GainX tick-interval family; broker terms apply',
      'Weltrade · SyntX guide',
    ],
  ),
  ...['1', '2', '3', '4', '5'].map(
    (n): [string, AssetCategory, string, string] => [
      `FlipX ${n}`,
      'Synthetic Indices',
      'FlipX fixed-step variant; verify exact contract',
      'Weltrade · SyntX guide',
    ],
  ),
  ...['600', '1200', '1800'].flatMap((n): Array<[string, AssetCategory, string, string]> => [
    [`SwitchX ${n}`, 'Synthetic Indices', 'SwitchX variant; verify exact contract', 'Weltrade · SyntX guide'],
    [`BreakX ${n}`, 'Synthetic Indices', 'BreakX variant; verify exact contract', 'Weltrade · SyntX guide'],
    [`TrendX ${n}`, 'Synthetic Indices', 'TrendX variant; verify exact contract', 'Weltrade · SyntX guide'],
  ]),
  ['PlusX 1', 'Synthetic Indices', 'Linear progression index', 'Weltrade · SyntX guide'],
  ['FiboX', 'Synthetic Indices', 'Fibonacci progression index', 'Weltrade · SyntX guide'],
  ['QuadX', 'Synthetic Indices', 'Quadratic progression index', 'Weltrade · SyntX guide'],
  ['MAX PainX', 'Synthetic Indices', 'Synthetic progression / PainX family', 'Weltrade · SyntX guide'],
  ['MAX GainX', 'Synthetic Indices', 'Synthetic progression / GainX family', 'Weltrade · SyntX guide'],
  ['US Treasury Bill', 'Money Markets', 'Instrument, maturity, and yield required', 'BETZO category'],
  ['Equity CFD', 'Derivatives', 'Underlying and contract specifications required', 'Weltrade · CFD product category'],
  ['Listed REIT', 'REITs', 'Exchange, ticker, and share class required', 'BETZO category'],
];

export const INSTRUMENTS: Instrument[] = catalogueSeed.map(([symbol, category, reference, source]) => ({
  symbol,
  category,
  reference,
  source,
}));

export const ASSET_CATEGORIES: AssetCategory[] = [
  'Forex',
  'Metals',
  'Energy',
  'Stock Indices',
  'Stocks',
  'ETFs',
  'Bonds',
  'Crypto',
  'Agriculture',
  'Synthetic Indices',
  'Derivatives',
  'Money Markets',
  'REITs',
];

export const SOURCE_FILTERS = ['Forex Factory', 'Weltrade', 'TradingView', 'BETZO category'] as const;

const CHARTABLE_CATEGORIES: AssetCategory[] = [
  'Forex',
  'Metals',
  'Energy',
  'Stock Indices',
  'Stocks',
  'ETFs',
  'Bonds',
  'Crypto',
  'Agriculture',
  'Synthetic Indices',
  'Derivatives',
];

/** Deduplicated, alphabetically sorted symbol list for chart selectors. */
export const CHART_UNIVERSE: Array<{ symbol: string; category: AssetCategory }> = Array.from(
  new Map(
    INSTRUMENTS.filter((i) => CHARTABLE_CATEGORIES.includes(i.category)).map((i) => [i.symbol, i.category]),
  ).entries(),
)
  .map(([symbol, category]) => ({ symbol, category }))
  .sort((a, b) => a.symbol.localeCompare(b.symbol));

export function tradingViewUrl(symbol: string): string {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`;
}

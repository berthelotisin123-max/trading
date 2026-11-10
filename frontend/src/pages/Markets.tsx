import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ASSET_CATEGORIES, INSTRUMENTS, SOURCE_FILTERS } from '../lib/instruments';
import { readJson, writeJson } from '../lib/storage';
import { useToast } from '../context/ToastContext';

export default function Markets() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<string>('all');
  const [source, setSource] = useState<string>('all');
  const [watchlist, setWatchlist] = useState<string[]>(() => readJson<string[]>('betzoWatchlist', []));

  // Keep the filter in sync when the top-bar search navigates here.
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    writeJson('betzoWatchlist', watchlist);
  }, [watchlist]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INSTRUMENTS.filter(
      (i) =>
        (category === 'all' || i.category === category) &&
        (source === 'all' || i.source.startsWith(source)) &&
        (!q || [i.symbol, i.category, i.reference, i.source].join(' ').toLowerCase().includes(q)),
    );
  }, [query, category, source]);

  const toggleWatch = (symbol: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      toast(prev.includes(symbol) ? `${symbol} removed from your local watchlist.` : `${symbol} added to your local watchlist.`);
      return next;
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) setSearchParams({ q: value }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Discover</div>
          <h1>Markets &amp; assets</h1>
          <p>Reference catalogue built from public market categories and instrument examples. It does not provide prices or promise broker availability.</p>
        </div>
      </div>

      <div className="catalog-note">
        <b>Catalogue only · No live feed connected.</b> Symbols are examples collected from public
        TradingView market categories, Forex Factory&apos;s forex market guide, and Weltrade&apos;s
        instrument overview. Broker symbol names, account eligibility, exchange rights, and data
        coverage vary. A CFD is price exposure, not ownership of the underlying asset.
        <br /><br />
        Sources:{' '}
        <a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer">TradingView markets</a>
        {' · '}
        <a href="https://calendar.forexfactory.com/userguide" target="_blank" rel="noopener noreferrer">Forex Factory Market guide</a>
        {' · '}
        <a href="https://support.weltrade.com/en/articles/11712079-available-trading-instruments-forex-metals-indices-etc" target="_blank" rel="noopener noreferrer">Weltrade instrument overview</a>
        {' · '}
        <a href="https://support.weltrade.com/en/articles/15231276-syntx-indices-complete-guide" target="_blank" rel="noopener noreferrer">Weltrade SyntX guide</a>
      </div>

      <div className="filters">
        <input
          aria-label="Search instruments"
          placeholder="Search symbol, asset, or source…"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
        />
        <select aria-label="Filter by asset class" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All asset classes</option>
          {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Filter by reference source" value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="all">All references</option>
          {SOURCE_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Asset class</th>
              <th>Reference / Type</th>
              <th>Source example</th>
              <th>Data status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const watched = watchlist.includes(row.symbol);
              return (
                <tr key={row.symbol}>
                  <td><b>{row.symbol}</b></td>
                  <td>{row.category}</td>
                  <td className="muted">{row.reference}</td>
                  <td className="market-source">{row.source}</td>
                  <td><span className="tag neutral">No live feed</span></td>
                  <td>
                    <button className="pill watch-action" type="button" onClick={() => toggleWatch(row.symbol)} aria-pressed={watched}>
                      {watched ? '★ In watchlist' : '＋ Watch'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6}>No matching instruments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="chart-footnote">{rows.length} instrument example{rows.length === 1 ? '' : 's'} shown · {watchlist.length} in your local watchlist. Stored in this browser only.</p>
    </>
  );
}

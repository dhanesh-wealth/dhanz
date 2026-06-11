import { useState, useEffect } from 'react';
import { fetchMarketRates } from '../api/videos';
import './MarketTicker.css';

const REFRESH_MS = 30000;

function formatPrice(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(change, percent) {
  if (change == null) return '';
  const sign = change >= 0 ? '+' : '';
  const pct = percent != null ? ` (${sign}${percent.toFixed(2)}%)` : '';
  return `${sign}${change.toFixed(2)}${pct}`;
}

function TickerItem({ item }) {
  const isUp = item.change >= 0;
  return (
    <span className={`ticker__item ${isUp ? 'ticker__item--up' : 'ticker__item--down'}`}>
      <strong>{item.name}</strong>
      <span className="ticker__price">{formatPrice(item.price)}</span>
      <span className="ticker__change">{formatChange(item.change, item.changePercent)}</span>
    </span>
  );
}

export default function MarketTicker() {
  const [rates, setRates] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await fetchMarketRates();
        if (active) {
          setRates(data.rates || []);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const displayRates = rates.filter((r) => r.price != null);
  const items = displayRates.length
    ? [...displayRates, ...displayRates]
    : [];

  return (
    <div className="market-ticker" role="marquee" aria-label="Live Indian market rates">
      <div className="market-ticker__label">
        <span className="market-ticker__live" aria-hidden="true" />
        LIVE
      </div>
      <div className="market-ticker__track-wrap">
        <div className={`market-ticker__track ${items.length ? '' : 'market-ticker__track--static'}`}>
          {items.length > 0 ? (
            items.map((item, i) => (
              <TickerItem key={`${item.symbol}-${i}`} item={item} />
            ))
          ) : (
            <span className="ticker__item ticker__item--loading">
              {loading ? 'Loading live market rates…' : 'Market rates temporarily unavailable'}
            </span>
          )}
        </div>
      </div>
      {updatedAt && (
        <time className="market-ticker__time" dateTime={updatedAt}>
          {new Date(updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </time>
      )}
    </div>
  );
}

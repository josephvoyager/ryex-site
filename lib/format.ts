/** Format USD with optional decimals */
export const fmtUSD = (v: number | null | undefined, dec: number = 0): string =>
  v == null
    ? '—'
    : '$' +
      v.toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });

/** Format price with smart decimal places */
export const fmtPrice = (v: number): string =>
  v >= 1000
    ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : v >= 1
    ? v.toFixed(2)
    : v.toFixed(4);

/** Format percentage with sign */
export const fmtPct = (v: number, dec: number = 2): string =>
  (v >= 0 ? '+' : '') + v.toFixed(dec) + '%';

/** Concatenate class names, filtering falsy values */
export const clsx = (...a: (string | false | null | undefined)[]): string =>
  a.filter(Boolean).join(' ');

export type Zone = { key: 'safe' | 'redeem' | 'liq'; label: string; cls: string };

export function getZone(
  ltv: number,
  maxLTV: number,
  rlt: number,
  lltv: number
): Zone {
  if (ltv >= lltv) return { key: 'liq', label: 'Liquidation', cls: 'zone-liq' };
  if (ltv >= rlt) return { key: 'redeem', label: 'Redeemable', cls: 'zone-redeem' };
  if (ltv >= maxLTV) return { key: 'redeem', label: 'Redeemable', cls: 'zone-redeem' };
  return { key: 'safe', label: 'Safe', cls: 'zone-safe' };
}

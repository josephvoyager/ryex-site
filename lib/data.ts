// ============ TYPES ============
export type Asset = {
  symbol: string;
  name: string;
  cat: string;
  dex: string;
  price: number;
  change: number;
  high?: number;
  low?: number;
  vol?: string;
  oi?: string;
  funding: string;
  poolAPR?: number;
  dnAPR?: number;
  maxLTV1x?: number;
};

export type Position = {
  id: number;
  asset: string;
  dex: string;
  dir: 'Long' | 'Short';
  lev: string;
  size: number;
  margin: number;
  entry: number;
  current: number;
  pnl: number;
  pnlPct: number;
  minted: number;
  ltv: number;
  liqPrice: number;
  health: number;
  time: string;
};

// ============ DEXES ============
export const DEXES = [
  { id: 'gmx', name: 'GMX', chain: 'Arbitrum', color: 'oklch(0.72 0.17 228)' },
  { id: 'hyperliquid', name: 'Hyperliquid', chain: 'Hyperliquid L1', color: 'oklch(0.80 0.16 160)' },
  { id: 'ostium', name: 'Ostium', chain: 'Arbitrum', color: 'oklch(0.76 0.14 280)' },
];

// ============ ASSETS ============
export const ALL_ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', cat: 'Crypto', dex: 'gmx', price: 75000, change: 2.14, high: 76200, low: 73800, vol: '$420M', oi: '$340M', funding: '0.0100%', poolAPR: 10.2, dnAPR: 7.9, maxLTV1x: 80 },
  { symbol: 'ETH', name: 'Ethereum', cat: 'Crypto', dex: 'gmx', price: 2340, change: 1.62, high: 2380, low: 2300, vol: '$280M', oi: '$210M', funding: '0.0080%', poolAPR: 12.4, dnAPR: 6.3, maxLTV1x: 85 },
  { symbol: 'SOL', name: 'Solana', cat: 'Crypto', dex: 'gmx', price: 85, change: 4.32, high: 87.4, low: 82.2, vol: '$120M', oi: '$85M', funding: '0.0120%', poolAPR: 18.6, dnAPR: 8.5, maxLTV1x: 75 },
  { symbol: 'HYPE', name: 'Hyperliquid', cat: 'Crypto', dex: 'gmx', price: 44, change: 8.52, high: 45.2, low: 40.1, vol: '$85M', oi: '$42M', funding: '0.0150%', poolAPR: 24.2, dnAPR: 10.3, maxLTV1x: 70 },
  { symbol: 'XAUT', name: 'Tether Gold', cat: 'Commodities', dex: 'gmx', price: 4780, change: 0.42, high: 4810, low: 4750, vol: '$52M', oi: '$120M', funding: '0.0050%', poolAPR: 8.8, dnAPR: 4.4, maxLTV1x: 88 },
  { symbol: 'WTI', name: 'Crude Oil', cat: 'Commodities', dex: 'gmx', price: 95, change: 0.87, high: 96.2, low: 93.8, vol: '$99M', oi: '$7.0M', funding: '0.0500%', poolAPR: 14.2, dnAPR: 39.4, maxLTV1x: 80 },
  { symbol: 'TSLA', name: 'Tesla', cat: 'Stocks', dex: 'gmx', price: 389, change: 3.24, high: 395.8, low: 378.1, vol: '$1.0M', oi: '$2.1M', funding: '0.0080%', poolAPR: 16.8, dnAPR: 6.1, maxLTV1x: 78 },
];

// ============ MINTABLE — rToken params ============
const BUFFER = 0.10, TARGET_DROP = 0.05;
function buildTiers(maxLev: number, maxLTV1x: number) {
  const m: Record<number, number> = {}, r: Record<number, number> = {}, l: Record<number, number> = {};
  const lltv = maxLTV1x + BUFFER;
  for (let i = 1; i <= maxLev; i++) {
    const raw = (lltv * (1 - i * TARGET_DROP)) / (1 - TARGET_DROP);
    const mx = Math.round(Math.min(maxLTV1x, Math.max(0, raw)) * 100 * 10) / 10;
    m[i] = mx; r[i] = Math.round((mx + (lltv * 100 - mx) * 0.5) * 10) / 10; l[i] = Math.round(lltv * 100);
  }
  return { maxLTV: m, rlt: r, lltv: l };
}

export type MintableAsset = {
  symbol: string;
  name: string;
  cat: string;
  price: number;
  maxLev: number;
  maxLTV: Record<number, number>;
  rlt: Record<number, number>;
  lltv: Record<number, number>;
  available: boolean;
};

export const MINTABLE_ASSETS: MintableAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', cat: 'Crypto', price: 75000, maxLev: 10, ...buildTiers(10, 0.80), available: true },
  { symbol: 'ETH', name: 'Ethereum', cat: 'Crypto', price: 2340, maxLev: 10, ...buildTiers(10, 0.85), available: true },
  { symbol: 'SOL', name: 'Solana', cat: 'Crypto', price: 85, maxLev: 5, ...buildTiers(5, 0.75), available: true },
  { symbol: 'HYPE', name: 'Hyperliquid', cat: 'Crypto', price: 44, maxLev: 5, ...buildTiers(5, 0.70), available: true },
  { symbol: 'XAUT', name: 'Tether Gold', cat: 'Commodities', price: 4780, maxLev: 10, ...buildTiers(10, 0.88), available: true },
  { symbol: 'WTI', name: 'Crude Oil', cat: 'Commodities', price: 95, maxLev: 5, ...buildTiers(5, 0.80), available: true },
  { symbol: 'TSLA', name: 'Tesla', cat: 'Stocks', price: 389, maxLev: 5, ...buildTiers(5, 0.78), available: true },
];

// ============ INITIAL DATA ============
export const INIT_POSITIONS: Position[] = [
  { id: 1, asset: 'BTC', dex: 'gmx', dir: 'Long', lev: '2x', size: 20000, margin: 10000, entry: 67800, current: 75000, pnl: 478, pnlPct: 4.78, minted: 0.115, ltv: 40, liqPrice: 35200, health: 1.62, time: '2h ago' },
  { id: 2, asset: 'ETH', dex: 'gmx', dir: 'Long', lev: '1x', size: 25000, margin: 25000, entry: 3380, current: 2340, pnl: 1038, pnlPct: 4.15, minted: 3.55, ltv: 48, liqPrice: 0, health: 1.63, time: '1d ago' },
  { id: 3, asset: 'SOL', dex: 'gmx', dir: 'Long', lev: '3x', size: 15000, margin: 5000, entry: 168.2, current: 85, pnl: 928, pnlPct: 18.56, minted: 12.6, ltv: 14, liqPrice: 124.5, health: 3.21, time: '3d ago' },
  { id: 4, asset: 'XAUT', dex: 'gmx', dir: 'Long', lev: '2x', size: 30000, margin: 15000, entry: 3080, current: 4780, pnl: 434, pnlPct: 2.89, minted: 4.82, ltv: 49, liqPrice: 1580, health: 1.59, time: '5h ago' },
];

export const INIT_ORDERS = [
  { id: 101, asset: 'BTC', dex: 'gmx', type: 'Limit', dir: 'Long', lev: '2x', price: 66000, size: 5000, status: 'Open', time: '1h ago' },
  { id: 102, asset: 'HYPE', dex: 'gmx', type: 'Limit', dir: 'Long', lev: '2x', price: 25.00, size: 3000, status: 'Open', time: '4h ago' },
  { id: 103, asset: 'SOL', dex: 'gmx', type: 'Stop', dir: 'Long', lev: '3x', price: 165.00, size: 2000, status: 'Open', time: '2h ago' },
];

export const INIT_HISTORY = [
  { asset: 'ETH', dir: 'Long', lev: '2x', entry: 3280, exit: 3520.40, pnl: 1464, pnlPct: 14.64, time: 'Apr 7' },
  { asset: 'HYPE', dir: 'Long', lev: '1x', entry: 24.20, exit: 28.40, pnl: 868, pnlPct: 17.36, time: 'Apr 5' },
  { asset: 'BTC', dir: 'Long', lev: '2x', entry: 66800, exit: 69420, pnl: 785, pnlPct: 7.85, time: 'Apr 3' },
];

// ============ rYIELD VAULTS ============
export type RYieldVault = {
  symbol: string; name: string; cat: string; price: number; tvl: number; deposits: number;
  funding8h: number; aprRecent: number; aprNeutral: number; vol: string; highlight?: boolean;
};

export const RYIELD_VAULTS: RYieldVault[] = [
  { symbol: 'BTC', name: 'Bitcoin', cat: 'Crypto', price: 75000, tvl: 34_000_000, deposits: 1842, funding8h: 0.010, aprRecent: 1.1, aprNeutral: 3.6, vol: 'moderate' },
  { symbol: 'ETH', name: 'Ethereum', cat: 'Crypto', price: 2340, tvl: 21_000_000, deposits: 1204, funding8h: 0.008, aprRecent: 1.1, aprNeutral: 3.6, vol: 'moderate-high' },
  { symbol: 'SOL', name: 'Solana', cat: 'Crypto', price: 85, tvl: 8_500_000, deposits: 612, funding8h: 0.012, aprRecent: 4.9, aprNeutral: 9.8, vol: 'high' },
  { symbol: 'HYPE', name: 'Hyperliquid', cat: 'Crypto', price: 44, tvl: 4_200_000, deposits: 284, funding8h: 0.015, aprRecent: 3.0, aprNeutral: 6.7, vol: 'very-high' },
  { symbol: 'XAUT', name: 'Tether Gold', cat: 'Commodities', price: 4780, tvl: 12_000_000, deposits: 318, funding8h: 0.005, aprRecent: 1.1, aprNeutral: 2.4, vol: 'low' },
  { symbol: 'WTI', name: 'Crude Oil', cat: 'Commodities', price: 95, tvl: 7_000_000, deposits: 498, funding8h: 0.030, aprRecent: 16.0, aprNeutral: 22.2, vol: 'moderate', highlight: true },
  { symbol: 'TSLA', name: 'Tesla', cat: 'Stocks', price: 389, tvl: 2_100_000, deposits: 162, funding8h: 0.018, aprRecent: 8.6, aprNeutral: 12.9, vol: 'high' },
];

export const MY_VAULTS = [
  { symbol: 'BTC', deposited: 5000, rtokenShort: 0.04800, shortNotional: 3600, dailyYield: 1.08, apr: 7.9, pnl: 30.85, days: 30, opened: 'Mar 22' },
  { symbol: 'ETH', deposited: 3000, rtokenShort: 0.9808, shortNotional: 2295, dailyYield: 0.55, apr: 6.3, pnl: 14.72, days: 30, opened: 'Mar 22' },
  { symbol: 'WTI', deposited: 2000, rtokenShort: 15.158, shortNotional: 1440, dailyYield: 2.16, apr: 39.4, pnl: 68.24, days: 30, opened: 'Mar 22' },
];

export const MY_LP_POSITIONS = [
  { pair: 'rBTC/USDC', type: 'V2', deposited: 8500, feesEarned: 42.30, incentivesEarned: 93.50, dailyYield: 3.72, unclaimed: 12.40 },
  { pair: 'rETH/USDC', type: 'V2', deposited: 3500, feesEarned: 22.10, incentivesEarned: 48.70, dailyYield: 1.94, unclaimed: 5.80 },
  { pair: 'rBTC/WBTC', type: 'V3', deposited: 2000, feesEarned: 8.40, incentivesEarned: 7.20, dailyYield: 0.42, unclaimed: 1.30 },
];

export const POOLS = [
  { pair: 'rBTC/USDC', tvl: '$12.4M', vol: '$3.8M', apr: 10.2, fee: '0.30%', type: 'V2' },
  { pair: 'rETH/USDC', tvl: '$8.2M', vol: '$2.1M', apr: 12.4, fee: '0.30%', type: 'V2' },
  { pair: 'rSOL/USDC', tvl: '$4.8M', vol: '$1.4M', apr: 18.6, fee: '0.30%', type: 'V2' },
  { pair: 'rHYPE/USDC', tvl: '$2.1M', vol: '$890K', apr: 24.2, fee: '0.30%', type: 'V2' },
  { pair: 'rXAUT/USDC', tvl: '$6.1M', vol: '$720K', apr: 8.8, fee: '0.30%', type: 'V2' },
  { pair: 'rBTC/WBTC', tvl: '$5.8M', vol: '$1.2M', apr: 6.4, fee: '0.05%', type: 'V3' },
  { pair: 'rXAUT/WBTC', tvl: '$1.4M', vol: '$320K', apr: 9.2, fee: '0.30%', type: 'V3' },
  { pair: 'rETH/WETH', tvl: '$4.6M', vol: '$980K', apr: 5.8, fee: '0.05%', type: 'V3' },
];

// ============ Liquidation queue ============
export type LiqVault = {
  id: string; owner: string; asset: string; lev: string;
  collateral: number; debt: number; ltv: number; zone: 'liquidation' | 'redeemable';
};

export const LIQ_VAULTS: LiqVault[] = (function () {
  const assets = [
    { sym: 'BTC', maxLTV: 80, lltv: 90 },
    { sym: 'ETH', maxLTV: 85, lltv: 95 },
    { sym: 'SOL', maxLTV: 75, lltv: 85 },
    { sym: 'HYPE', maxLTV: 70, lltv: 80 },
    { sym: 'WTI', maxLTV: 80, lltv: 90 },
    { sym: 'XAUT', maxLTV: 88, lltv: 98 },
    { sym: 'TSLA', maxLTV: 78, lltv: 88 },
  ];
  let s = 1;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const arr: LiqVault[] = [];
  for (let i = 0; i < 42; i++) {
    const a = assets[i % assets.length];
    const levs = a.sym === 'BTC' || a.sym === 'ETH' || a.sym === 'XAUT' ? [1, 1, 2, 2, 3, 5] : [1, 1, 1, 2, 2, 3];
    const lev = levs[Math.floor(rnd() * levs.length)];
    const pct = rnd() * rnd();
    const ltv = +(a.maxLTV + (a.lltv - a.maxLTV) * (pct * 0.95 + 0.02)).toFixed(1);
    const collateral = Math.round(3000 + rnd() * 95000);
    const debt = Math.round(collateral * ltv / 100);
    const hexA = Math.floor(rnd() * 0xfff).toString(16).padStart(3, '0');
    const hexB = Math.floor(rnd() * 0xfff).toString(16).padStart(3, '0');
    arr.push({
      id: 'P-' + String(i + 1).padStart(3, '0'),
      owner: '0x' + hexA + '…' + hexB,
      asset: a.sym, lev: lev + 'x',
      collateral, debt, ltv,
      zone: ltv >= a.lltv ? 'liquidation' : 'redeemable',
    });
  }
  return arr;
})();

export type EnrichedLiqVault = LiqVault & { mx: number; rl: number; ll: number; healthVal: number };

export function getRLTQueue(): EnrichedLiqVault[] {
  return LIQ_VAULTS.map(v => {
    const mi = MINTABLE_ASSETS.find(m => m.symbol === v.asset);
    const lev = +v.lev.replace('x', '');
    const mx = mi?.maxLTV[lev] || 80, rl = mi?.rlt[lev] || 85, ll = mi?.lltv[lev] || 90;
    const healthVal = ll / v.ltv;
    return { ...v, mx, rl, ll, healthVal };
  })
    .filter(v => v.healthVal >= 1.01 && v.ltv >= v.mx)
    .sort((a, b) => a.healthVal - b.healthVal);
}

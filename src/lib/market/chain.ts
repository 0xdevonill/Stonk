import type { Candle, TokenStats } from '../api/types';
import { contracts } from '../contracts/config';
import type { SwapQuote } from '../trade/quote';
import { ethCall } from '../rpc/client';

const Q96 = 1n << 96n;
const MAX_TICK = 887272;

const SEL = {
  name: '0x06fdde03',
  symbol: '0x95d89b41',
  decimals: '0x313ce567',
  totalSupply: '0x18160ddd',
  curve: '0x7165485d',
  pairToken: '0x3de35b79',
  graduated: '0xe7c2b772',
  factory: '0xc45a0155',
  poolManager: '0xdc4c90d3',
  memeHook: '0x6651812c',
  getLaunchedToken: '0x3cf28b5a',
  launches: '0xad091230',
  getSlot0: '0xc815641c',
  getLiquidity: '0xfa6793d5',
  quoteExactInputSingle: '0xaa9d21cb',
} as const;

export interface PoolMarket {
  token: string;
  quoteToken: string;
  tokenDecimals: number;
  quoteDecimals: number;
  tokenSymbol: string;
  tokenName: string;
  quoteSymbol: string;
  curve: string;
  hooks: string;
  tickSpacing: number;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  quotePerToken: number;
  quotePriceUsd: number;
  tokenPriceUsd: number;
  takerFeeBps: number;
  totalSupply: number;
  liquidityUsd: number | null;
  marketCapUsd: number;
}

let cached: PoolMarket | null = null;
let inflight: Promise<PoolMarket> | null = null;

function words(hex: string): bigint[] {
  const body = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out: bigint[] = [];
  for (let i = 0; i < body.length; i += 64) {
    const slice = body.slice(i, i + 64);
    if (slice.length < 64) break;
    out.push(BigInt(`0x${slice}`));
  }
  return out;
}

function addressOf(word: bigint): string {
  return `0x${word.toString(16).padStart(40, '0').slice(-40)}`;
}

function padWord(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

function decodeString(hex: string): string {
  const data = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (data.length < 128) return '';
  const length = Number(BigInt(`0x${data.slice(64, 128)}`));
  const bytes = data.slice(128, 128 + length * 2);
  let text = '';
  for (let i = 0; i < bytes.length; i += 2) {
    text += String.fromCharCode(parseInt(bytes.slice(i, i + 2), 16));
  }
  return text;
}

function fromRaw(value: bigint, decimals: number): number {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const frac = value % base;
  return Number(whole) + Number(frac) / Number(base);
}

function toRaw(amount: number, decimals: number): bigint {
  if (!(amount > 0) || !Number.isFinite(amount)) return 0n;
  const [whole, fraction = ''] = amount.toFixed(decimals).split('.');
  const digits = `${whole}${fraction.padEnd(decimals, '0').slice(0, decimals)}`.replace(/^-/, '');
  return BigInt(digits || '0');
}

/** Uniswap v3/v4 sqrt ratio at a tick. */
function sqrtRatioAtTick(tick: number): bigint {
  const absTick = tick < 0 ? -tick : tick;
  if (absTick > MAX_TICK) throw new Error('Tick out of range');
  let ratio =
    (absTick & 0x1) !== 0
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;
  if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if (absTick & 0x4000) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if (absTick & 0x10000) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if (absTick & 0x20000) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if (absTick & 0x40000) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if (absTick & 0x80000) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;
  if (tick > 0) ratio = ((1n << 256n) - 1n) / ratio;
  const round = ratio % (1n << 32n) === 0n ? 0n : 1n;
  return (ratio >> 32n) + round;
}

function humanPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const rawScaled = (sqrtPriceX96 * sqrtPriceX96 * 10n ** 18n) / (Q96 * Q96);
  const raw = Number(rawScaled) / 1e18;
  return raw * 10 ** (decimals0 - decimals1);
}

function keccakPoolId(currency0: string, currency1: string, fee: number, tickSpacing: number, hooks: string): string {
  const encoded = `${padWord(BigInt(currency0))}${padWord(BigInt(currency1))}${padWord(BigInt(fee))}${padWord(BigInt(tickSpacing))}${padWord(BigInt(hooks))}`;
  const bytes = new Uint8Array(encoded.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(encoded.slice(i * 2, i * 2 + 2), 16);
  return `0x${bytesToHex(keccak256(bytes))}`;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Keccak-256 (Ethereum). Compact implementation so the browser can hash a pool id. */
function keccak256(input: Uint8Array): Uint8Array {
  const rate = 136;
  const state = new Uint8Array(200);
  const block = new Uint8Array(rate);
  let offset = 0;
  for (const byte of input) {
    block[offset++] = byte;
    if (offset === rate) {
      xorIn(state, block);
      keccakF(state);
      offset = 0;
    }
  }
  block.fill(0, offset);
  block[offset] = 0x01;
  block[rate - 1] |= 0x80;
  xorIn(state, block);
  keccakF(state);
  return state.slice(0, 32);
}

function xorIn(state: Uint8Array, block: Uint8Array): void {
  for (let i = 0; i < block.length; i += 1) state[i] ^= block[i];
}

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n, 0x000000000000808bn,
  0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n, 0x000000000000008an, 0x0000000000000088n,
  0x0000000080008009n, 0x000000008000000an, 0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n,
  0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
const ROT = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
];

function keccakF(state: Uint8Array): void {
  const lanes = new BigUint64Array(25);
  for (let i = 0; i < 25; i += 1) {
    let value = 0n;
    for (let b = 0; b < 8; b += 1) value |= BigInt(state[i * 8 + b]) << BigInt(8 * b);
    lanes[i] = value;
  }
  for (let round = 0; round < 24; round += 1) {
    const c = new Array<bigint>(5);
    for (let x = 0; x < 5; x += 1) c[x] = lanes[x] ^ lanes[x + 5] ^ lanes[x + 10] ^ lanes[x + 15] ^ lanes[x + 20];
    const d = new Array<bigint>(5);
    for (let x = 0; x < 5; x += 1) d[x] = c[(x + 4) % 5] ^ rotl(c[(x + 1) % 5], 1);
    for (let i = 0; i < 25; i += 1) lanes[i] ^= d[i % 5];
    const b = new BigUint64Array(25);
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const i = x + 5 * y;
        b[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(lanes[i], ROT[i]);
      }
    }
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const i = x + 5 * y;
        const notNext = ~b[((x + 1) % 5) + 5 * y] & 0xffffffffffffffffn;
        lanes[i] = (b[i] ^ (notNext & b[((x + 2) % 5) + 5 * y])) & 0xffffffffffffffffn;
      }
    }
    lanes[0] ^= RC[round];
  }
  for (let i = 0; i < 25; i += 1) {
    let value = lanes[i];
    for (let b = 0; b < 8; b += 1) {
      state[i * 8 + b] = Number(value & 0xffn);
      value >>= 8n;
    }
  }
}

function rotl(value: bigint, shift: number): bigint {
  if (shift === 0) return value;
  return ((value << BigInt(shift)) | (value >> BigInt(64 - shift))) & 0xffffffffffffffffn;
}

function amount0(sqrtA: bigint, sqrtB: bigint, liquidity: bigint): bigint {
  if (sqrtA > sqrtB) return amount0(sqrtB, sqrtA, liquidity);
  if (sqrtA === 0n) return 0n;
  return (((liquidity << 96n) * (sqrtB - sqrtA)) / sqrtB) / sqrtA;
}

function amount1(sqrtA: bigint, sqrtB: bigint, liquidity: bigint): bigint {
  if (sqrtA > sqrtB) return amount1(sqrtB, sqrtA, liquidity);
  return (liquidity * (sqrtB - sqrtA)) / Q96;
}

const USDG_TIERS: Array<{ fee: number; tickSpacing: number }> = [
  { fee: 100, tickSpacing: 1 },
  { fee: 500, tickSpacing: 10 },
  { fee: 3000, tickSpacing: 60 },
  { fee: 10000, tickSpacing: 200 },
  { fee: 50000, tickSpacing: 1000 },
  { fee: 100000, tickSpacing: 1000 },
];

async function quoteUsd(quoteToken: string, quoteDecimals: number): Promise<number> {
  const usdg = contracts.usdgAddress;
  const [left, right] = BigInt(quoteToken) < BigInt(usdg) ? [quoteToken, usdg] : [usdg, quoteToken];
  const quoteIsToken0 = BigInt(quoteToken) < BigInt(usdg);
  const found = await Promise.all(
    USDG_TIERS.map(async (tier) => {
      try {
        const poolId = keccakPoolId(left, right, tier.fee, tier.tickSpacing, '0x0000000000000000000000000000000000000000');
        const [slot, liquidityHex] = await Promise.all([
          ethCall(contracts.stateViewAddress, `${SEL.getSlot0}${poolId.slice(2)}`),
          ethCall(contracts.stateViewAddress, `${SEL.getLiquidity}${poolId.slice(2)}`),
        ]);
        const sqrt = words(slot)[0] ?? 0n;
        const liquidity = words(liquidityHex)[0] ?? 0n;
        if (sqrt === 0n || liquidity === 0n) return null;
        const token1PerToken0 = humanPrice(sqrt, quoteIsToken0 ? quoteDecimals : 6, quoteIsToken0 ? 6 : quoteDecimals);
        const usd = quoteIsToken0 ? token1PerToken0 : token1PerToken0 > 0 ? 1 / token1PerToken0 : 0;
        if (!(usd > 0.5 && usd < 100_000)) return null;
        return { liquidity, usd };
      } catch {
        return null;
      }
    }),
  );
  const best = found.reduce<{ liquidity: bigint; usd: number } | null>((current, next) => {
    if (!next) return current;
    if (!current || next.liquidity > current.liquidity) return next;
    return current;
  }, null);
  if (!best) throw new Error('Quote token has no USDG pool price');
  return best.usd;
}

async function readPool(): Promise<PoolMarket> {
  const token = contracts.tokenAddress;
  const [nameHex, symbolHex, decimalsHex, supplyHex, curveHex] = await Promise.all([
    ethCall(token, SEL.name),
    ethCall(token, SEL.symbol),
    ethCall(token, SEL.decimals),
    ethCall(token, SEL.totalSupply),
    ethCall(token, SEL.curve),
  ]);
  const curve = addressOf(words(curveHex)[0] ?? 0n);
  const [pairHex, graduatedHex, factoryHex] = await Promise.all([
    ethCall(curve, SEL.pairToken),
    ethCall(curve, SEL.graduated),
    ethCall(curve, SEL.factory),
  ]);
  if ((words(graduatedHex)[0] ?? 0n) !== 1n) {
    throw new Error('This token is still on the bonding curve with no pool price');
  }
  const quoteToken = addressOf(words(pairHex)[0] ?? 0n);
  const factory = addressOf(words(factoryHex)[0] ?? 0n);
  const [quoteSymbolHex, quoteDecimalsHex, hookHex, launchHex] = await Promise.all([
    ethCall(quoteToken, SEL.symbol),
    ethCall(quoteToken, SEL.decimals),
    ethCall(factory, SEL.memeHook),
    ethCall(factory, `${SEL.getLaunchedToken}${padWord(BigInt(token))}`),
  ]);
  const hooks = addressOf(words(hookHex)[0] ?? 0n);
  const launchWords = words(launchHex);
  const tickSpacing = Number(launchWords[7] ?? 200n) || 200;
  const [currency0, currency1] =
    BigInt(token) < BigInt(quoteToken) ? [token, quoteToken] : [quoteToken, token];
  const tokenIs0 = BigInt(token) < BigInt(quoteToken);
  const poolId = keccakPoolId(currency0, currency1, 0, tickSpacing, hooks);
  const [slotHex, liquidityHex, hookLaunchHex] = await Promise.all([
    ethCall(contracts.stateViewAddress, `${SEL.getSlot0}${poolId.slice(2)}`),
    ethCall(contracts.stateViewAddress, `${SEL.getLiquidity}${poolId.slice(2)}`),
    ethCall(hooks, `${SEL.launches}${poolId.slice(2)}`),
  ]);
  const slot = words(slotHex);
  const sqrtPriceX96 = slot[0] ?? 0n;
  if (sqrtPriceX96 === 0n) throw new Error('Graduated pool has no price');
  const tokenDecimals = Number(words(decimalsHex)[0] ?? 18n);
  const quoteDecimals = Number(words(quoteDecimalsHex)[0] ?? 18n);
  const raw = humanPrice(sqrtPriceX96, tokenIs0 ? tokenDecimals : quoteDecimals, tokenIs0 ? quoteDecimals : tokenDecimals);
  const quotePerToken = tokenIs0 ? raw : raw > 0 ? 1 / raw : 0;
  const quotePriceUsd = await quoteUsd(quoteToken, quoteDecimals);
  const tokenPriceUsd = quotePerToken * quotePriceUsd;
  const hookWords = words(hookLaunchHex);
  const takerFeeBps = Number(hookWords[7] ?? 0n) + Number(hookWords[10] ?? 0n);
  const totalSupply = fromRaw(words(supplyHex)[0] ?? 0n, tokenDecimals);
  const liquidity = words(liquidityHex)[0] ?? 0n;
  const liquidityUsd = valueLiquidity({
    sqrtPriceX96,
    liquidity,
    tickSpacing,
    tokenIs0,
    tokenDecimals,
    quoteDecimals,
    tokenPriceUsd,
    quotePriceUsd,
  });

  return {
    token,
    quoteToken,
    tokenDecimals,
    quoteDecimals,
    tokenSymbol: decodeString(symbolHex),
    tokenName: decodeString(nameHex),
    quoteSymbol: decodeString(quoteSymbolHex),
    curve,
    hooks,
    tickSpacing,
    sqrtPriceX96,
    liquidity,
    quotePerToken,
    quotePriceUsd,
    tokenPriceUsd,
    takerFeeBps,
    totalSupply,
    liquidityUsd,
    marketCapUsd: tokenPriceUsd * totalSupply,
  };
}

function valueLiquidity(input: {
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tickSpacing: number;
  tokenIs0: boolean;
  tokenDecimals: number;
  quoteDecimals: number;
  tokenPriceUsd: number;
  quotePriceUsd: number;
}): number | null {
  if (input.liquidity === 0n) return null;
  const tickLower = Math.ceil(-MAX_TICK / input.tickSpacing) * input.tickSpacing;
  const tickUpper = Math.floor(MAX_TICK / input.tickSpacing) * input.tickSpacing;
  const sqrtLower = sqrtRatioAtTick(tickLower);
  const sqrtUpper = sqrtRatioAtTick(tickUpper);
  const sqrtPrice = input.sqrtPriceX96;
  if (sqrtPrice <= sqrtLower || sqrtPrice >= sqrtUpper) return null;
  const raw0 = fromRaw(amount0(sqrtPrice, sqrtUpper, input.liquidity), input.tokenIs0 ? input.tokenDecimals : input.quoteDecimals);
  const raw1 = fromRaw(amount1(sqrtLower, sqrtPrice, input.liquidity), input.tokenIs0 ? input.quoteDecimals : input.tokenDecimals);
  const tokenAmount = input.tokenIs0 ? raw0 : raw1;
  const quoteAmount = input.tokenIs0 ? raw1 : raw0;
  const usd = tokenAmount * input.tokenPriceUsd + quoteAmount * input.quotePriceUsd;
  return Number.isFinite(usd) && usd > 0 ? usd : null;
}

export function getPoolMarket(): PoolMarket | null {
  return cached;
}

export function loadPoolMarket(force = false): Promise<PoolMarket> {
  if (!force && cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = readPool()
    .then((market) => {
      cached = market;
      inflight = null;
      return market;
    })
    .catch((error: unknown) => {
      inflight = null;
      throw error;
    });
  return inflight;
}

export async function loadTokenStats(): Promise<TokenStats> {
  const market = await loadPoolMarket(true);
  return {
    symbol: market.tokenSymbol,
    name: market.tokenName,
    quoteSymbol: market.quoteSymbol,
    quoteToken: market.quoteToken,
    curveAddress: market.curve,
    priceUsd: market.tokenPriceUsd,
    quotePriceUsd: market.quotePriceUsd,
    change24hPct: null,
    change24hUsd: null,
    marketCapUsd: market.marketCapUsd,
    liquidityUsd: market.liquidityUsd,
    volume24hUsd: null,
    holders: null,
    transactions24h: null,
    stakedAmount: null,
    ethPriceUsd: null,
    ethChange24hPct: null,
    takerFeeBps: market.takerFeeBps,
    sparkline: [market.tokenPriceUsd, market.tokenPriceUsd],
    totalSupply: market.totalSupply,
    illustrative: false,
  };
}

export async function loadLiveCandle(): Promise<{ candles: Candle[] }> {
  const market = await loadPoolMarket();
  const now = Date.now();
  return {
    candles: [
      {
        time: now,
        open: market.tokenPriceUsd,
        high: market.tokenPriceUsd,
        low: market.tokenPriceUsd,
        close: market.tokenPriceUsd,
        volume: 0,
      },
    ],
  };
}

export async function quotePool(amountIn: number, zeroForOne: boolean, slippagePct: number): Promise<SwapQuote> {
  const empty: SwapQuote = {
    amountIn,
    amountOut: null,
    rate: null,
    impactPct: null,
    feeUsd: null,
    minReceived: null,
    valueUsd: null,
  };
  if (!(amountIn > 0)) return empty;
  const market = cached ?? (await loadPoolMarket());
  const decimalsIn = zeroForOne ? market.tokenDecimals : market.quoteDecimals;
  const decimalsOut = zeroForOne ? market.quoteDecimals : market.tokenDecimals;
  const rawIn = toRaw(amountIn, decimalsIn);
  const [token, quote] =
    BigInt(market.token) < BigInt(market.quoteToken)
      ? [market.token, market.quoteToken]
      : [market.quoteToken, market.token];
  const head = [
    padWord(BigInt(token)),
    padWord(BigInt(quote)),
    padWord(0n),
    padWord(BigInt(market.tickSpacing)),
    padWord(BigInt(market.hooks)),
    padWord(zeroForOne ? 1n : 0n),
    padWord(rawIn),
    padWord(0x100n),
    padWord(0n),
  ].join('');
  const data = `${SEL.quoteExactInputSingle}${padWord(0x20n)}${head}`;
  const result = await ethCall(contracts.quoterAddress, data);
  const amountOut = fromRaw(words(result)[0] ?? 0n, decimalsOut);
  const spotOut = zeroForOne ? amountIn * market.quotePerToken : amountIn / market.quotePerToken;
  const expected = spotOut * (1 - market.takerFeeBps / 10_000);
  const impactPct = expected > 0 ? Math.max(0, ((expected - amountOut) / expected) * 100) : null;
  const priceInUsd = zeroForOne ? market.tokenPriceUsd : market.quotePriceUsd;
  const valueUsd = amountIn * priceInUsd;
  return {
    amountIn,
    amountOut,
    rate: amountIn > 0 ? amountOut / amountIn : null,
    impactPct,
    feeUsd: valueUsd * (market.takerFeeBps / 10_000),
    minReceived: amountOut * (1 - slippagePct / 100),
    valueUsd,
  };
}

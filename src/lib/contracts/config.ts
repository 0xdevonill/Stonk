function readEnv(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

/** Mock-mode defaults. Deployments override every address through the environment. */
const DEFAULT_TOKEN = '0x1Ad69dDD9D98dD71b6211339A1801fD128A3925D';
const DEFAULT_STAKING = '0x000000000000000000000000000000000000571C';
const DEFAULT_ROUTER = '0x0000000000000000000000000000000000005A9A';

export const contracts = {
  chainId: Number(readEnv('VITE_CHAIN_ID', '4663')) || 4663,
  chainName: readEnv('VITE_CHAIN_NAME', 'Robinhood Chain'),
  tokenAddress: readEnv('VITE_STONK_TOKEN_ADDRESS', DEFAULT_TOKEN),
  stakingAddress: readEnv('VITE_STAKING_ADDRESS', DEFAULT_STAKING),
  routerAddress: readEnv('VITE_SWAP_ROUTER_ADDRESS', DEFAULT_ROUTER),
  dataMode: 'mock' as const,
};

export const tokenMeta = {
  symbol: 'STONK',
  displaySymbol: '$STONK',
  name: 'Mr.Stonk',
} as const;

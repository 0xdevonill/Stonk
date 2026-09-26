function readEnv(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

/** Chain defaults. The traded token is read from the contract; these are the Robinhood Chain endpoints around it. */
const DEFAULT_TOKEN = '0x0000000000000000000000000000000000000000';
const DEFAULT_STAKING = '0x000000000000000000000000000000000000571C';
const DEFAULT_QUOTER = '0x8dc178efb8111bb0973dd9d722ebeff267c98f94';
const DEFAULT_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b';
const DEFAULT_USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168';

export const contracts = {
  chainId: Number(readEnv('VITE_CHAIN_ID', '4663')) || 4663,
  chainName: readEnv('VITE_CHAIN_NAME', 'Robinhood Chain'),
  rpcUrl: readEnv('VITE_RPC_URL', 'https://rpc.mainnet.chain.robinhood.com'),
  tokenAddress: readEnv('VITE_STONK_TOKEN_ADDRESS', DEFAULT_TOKEN),
  stakingAddress: readEnv('VITE_STAKING_ADDRESS', DEFAULT_STAKING),
  routerAddress: readEnv('VITE_SWAP_ROUTER_ADDRESS', DEFAULT_QUOTER),
  quoterAddress: readEnv('VITE_QUOTER_ADDRESS', DEFAULT_QUOTER),
  stateViewAddress: readEnv('VITE_STATE_VIEW_ADDRESS', DEFAULT_STATE_VIEW),
  usdgAddress: readEnv('VITE_USDG_ADDRESS', DEFAULT_USDG),
  dataMode: 'chain' as const,
};

export const tokenMeta = {
  symbol: 'STONK',
  displaySymbol: '$STONK',
  name: 'Mr.Stonk',
} as const;

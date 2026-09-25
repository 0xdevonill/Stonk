import { erc20Abi, routerAbi, stakingAbi } from '../contracts/abi';
import { contracts } from '../contracts/config';
import { foreignChain, getExpectedChain } from './network';

export const contractInterfaces = {
  token: { address: contracts.tokenAddress, abi: erc20Abi },
  staking: { address: contracts.stakingAddress, abi: stakingAbi },
  router: { address: contracts.routerAddress, abi: routerAbi },
};

export type WalletId = 'metamask' | 'rabby' | 'coinbase' | 'walletconnect';

export interface WalletChoice {
  id: WalletId;
  name: string;
  recommended?: boolean;
  /** When true, mock detection returns a foreign chain until the user switches. */
  reportsForeignChain: boolean;
}

export const walletChoices: WalletChoice[] = [
  { id: 'metamask', name: 'MetaMask', recommended: true, reportsForeignChain: false },
  { id: 'rabby', name: 'Rabby', reportsForeignChain: false },
  { id: 'coinbase', name: 'Coinbase Wallet', reportsForeignChain: false },
  { id: 'walletconnect', name: 'WalletConnect', reportsForeignChain: true },
];

const mockAddresses: Record<WalletId, string> = {
  metamask: '0x4F2A91C8bE10d0A77E51c84B0eA6D3C19B7a0042',
  rabby: '0x91c0A11e88D4b21C6e77A0B4F09e7712c55D88E1',
  coinbase: '0x33B10e44C90a7712Aa09D8c21E5B77190cDE4418',
  walletconnect: '0xAa09D4418c21E5B10e44C7712c55D88E133B10e4',
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function connectMockWallet(id: WalletId): Promise<{ address: string; chainId: number }> {
  await wait(720);
  const choice = walletChoices.find((item) => item.id === id);
  const chainId = choice?.reportsForeignChain ? foreignChain.id : getExpectedChain().id;
  return { address: mockAddresses[id], chainId };
}

export async function switchMockChain(): Promise<number> {
  await wait(560);
  return getExpectedChain().id;
}

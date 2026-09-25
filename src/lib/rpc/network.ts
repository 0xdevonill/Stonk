import { contracts } from '../contracts/config';

export interface ChainInfo {
  id: number;
  name: string;
}

export function getExpectedChain(): ChainInfo {
  return { id: contracts.chainId, name: contracts.chainName };
}

/** Chain a mismatched mock connector reports before the user switches. */
export const foreignChain: ChainInfo = { id: 11155111, name: 'Sepolia' };

export function isExpectedChain(chainId: number): boolean {
  return chainId === getExpectedChain().id;
}

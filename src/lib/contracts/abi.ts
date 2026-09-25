/** Minimal ABI fragments. Mock mode does not call them; live wiring should. */
export const erc20Abi = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
] as const;

export const stakingAbi = [
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function claim()',
  'function pendingRewards(address) view returns (uint256)',
  'function stakedBalance(address) view returns (uint256)',
] as const;

export const routerAbi = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
] as const;

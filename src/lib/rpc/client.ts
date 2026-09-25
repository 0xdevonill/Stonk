import { contracts } from '../contracts/config';

interface RpcResponse {
  result?: string;
  error?: { message?: string };
}

export async function ethCall(to: string, data: string): Promise<string> {
  const response = await fetch(contracts.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  });
  if (!response.ok) {
    throw new Error(`RPC request failed (${response.status})`);
  }
  const body = (await response.json()) as RpcResponse;
  if (body.error) {
    throw new Error(body.error.message || 'Contract call reverted');
  }
  if (!body.result || body.result === '0x') {
    throw new Error('Empty contract response');
  }
  return body.result;
}

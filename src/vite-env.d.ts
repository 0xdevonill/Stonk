/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_CHAIN_NAME?: string;
  readonly VITE_STONK_TOKEN_ADDRESS?: string;
  readonly VITE_STAKING_ADDRESS?: string;
  readonly VITE_SWAP_ROUTER_ADDRESS?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_QUOTER_ADDRESS?: string;
  readonly VITE_STATE_VIEW_ADDRESS?: string;
  readonly VITE_USDG_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
  message: string;
}

interface EthereumRequest {
  method: string;
  params?: unknown[];
}

interface ProviderMessage {
  type: string;
  data: unknown;
}

declare global {
  interface Window {
    ethereum: {
      request: (args: EthereumRequest) => Promise<unknown>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
      selectedAddress: string | null;
      chainId: string;
      isConnected: () => boolean;
      providers?: unknown[];
    };
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };
  }
}
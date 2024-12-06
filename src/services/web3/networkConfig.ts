export const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";
export const AMOY_CHAIN_ID = 80002;

export const AMOY_NETWORK_CONFIG = {
  chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: [AMOY_RPC_URL],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
};
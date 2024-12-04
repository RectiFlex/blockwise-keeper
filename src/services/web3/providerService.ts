import { ethers } from 'ethers';
import { logger } from '@/lib/logger';
import { AMOY_CHAIN_ID, AMOY_NETWORK_CONFIG } from './config';

export class ProviderService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  private async initializeProvider(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Web3Service must be used in browser environment');
    }

    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature. Visit https://metamask.io');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
  }

  async connectWallet(): Promise<string> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      if (!this.provider) {
        throw new Error('Provider initialization failed');
      }

      // Request network switch to Polygon Amoy testnet
      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${AMOY_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [AMOY_NETWORK_CONFIG],
          });
        } else {
          throw switchError;
        }
      }

      await window.ethereum?.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider.getSigner();
      return await this.signer.getAddress();
    } catch (error: any) {
      logger.error('Error connecting wallet:', { error: error.message });
      throw new Error(error.message || 'Failed to connect wallet. Please make sure MetaMask is installed and you have POL tokens.');
    }
  }

  async getSigner(): Promise<ethers.Signer> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    return this.signer;
  }

  async getProvider(): Promise<ethers.BrowserProvider> {
    if (!this.provider) {
      await this.initializeProvider();
    }
    if (!this.provider) {
      throw new Error('Provider initialization failed');
    }
    return this.provider;
  }
}

export const providerService = new ProviderService();
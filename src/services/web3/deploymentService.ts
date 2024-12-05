import { ethers } from 'ethers';
import { logger } from '@/lib/logger';
import { PROPERTY_CONTRACT_ABI, PROPERTY_BYTECODE, AMOY_CHAIN_ID } from './config';
import { providerService } from './providerService';

export class DeploymentService {
  async deployPropertyContract(
    propertyId: string,
    title: string,
    address: string
  ): Promise<string> {
    try {
      const provider = await providerService.getProvider();
      const signer = await providerService.getSigner();

      logger.info('Initializing contract deployment...', {
        propertyId,
        title,
        address
      });

      // Ensure we're on the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(AMOY_CHAIN_ID)) {
        throw new Error('Please switch to Polygon Amoy Testnet in MetaMask');
      }

      // Check POL balance
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance === BigInt(0)) {
        throw new Error('Insufficient POL tokens. Please get POL tokens from the Polygon Amoy faucet.');
      }

      logger.info('Preparing contract deployment...', {
        propertyId,
        balance: balance.toString()
      });

      // Create contract factory
      const factory = new ethers.ContractFactory(
        PROPERTY_CONTRACT_ABI,
        PROPERTY_BYTECODE,
        signer
      );

      // Get current gas price
      const feeData = await provider.getFeeData();
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error('Could not estimate gas fees');
      }

      // Deploy with explicit gas settings and constructor arguments
      const contract = await factory.deploy(
        propertyId,
        title,
        address,
        {
          maxFeePerGas: feeData.maxFeePerGas * BigInt(12) / BigInt(10), // Add 20% buffer
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          gasLimit: BigInt(3000000), // Set a reasonable gas limit
        }
      );

      logger.info('Waiting for deployment transaction...');
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      logger.info('Contract deployed successfully:', { contractAddress });

      return contractAddress;
    } catch (error: any) {
      logger.error('Contract deployment failed:', { 
        error: error.message,
        code: error.code,
        details: error.details || 'No additional details',
        transaction: error.transaction || 'No transaction data'
      });

      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient POL tokens for deployment. Please get more tokens from the Polygon Amoy faucet.');
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected. Please try again and confirm the transaction in MetaMask.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network connection error. Please check your internet connection and try again.');
      }

      throw new Error(`Failed to deploy property contract: ${error.message}. Please ensure you have sufficient POL tokens and are connected to Polygon Amoy Testnet.`);
    }
  }
}

export const deploymentService = new DeploymentService();
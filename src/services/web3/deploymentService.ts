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

      logger.info('Starting contract deployment...', {
        propertyId,
        title,
        balance: balance.toString()
      });

      // Create contract factory with constructor arguments
      const factory = new ethers.ContractFactory(
        PROPERTY_CONTRACT_ABI,
        PROPERTY_BYTECODE,
        signer
      );

      // Get current network conditions
      const feeData = await provider.getFeeData();
      
      // Set gas parameters
      const deploymentParams = {
        gasLimit: BigInt(3000000),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      };

      logger.info('Deploying contract with parameters:', {
        gasLimit: deploymentParams.gasLimit.toString(),
        maxFeePerGas: deploymentParams.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: deploymentParams.maxPriorityFeePerGas?.toString()
      });

      // Deploy contract with constructor arguments
      const contract = await factory.deploy(
        propertyId,
        title,
        address,
        deploymentParams
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
      throw new Error(`Failed to deploy property contract: ${error.message}`);
    }
  }
}

export const deploymentService = new DeploymentService();
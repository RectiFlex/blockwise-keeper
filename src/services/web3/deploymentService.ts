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
        throw new Error('Insufficient POL tokens. Please get POL tokens from the Polygon Amoy faucet before deploying contracts.');
      }

      logger.info('Starting contract deployment process...');
      logger.info('Current POL balance:', { balance: balance.toString() });
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        PROPERTY_CONTRACT_ABI,
        PROPERTY_BYTECODE,
        signer
      );

      // Get current network conditions
      const feeData = await provider.getFeeData();
      logger.info('Current network fees:', {
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        gasPrice: feeData.gasPrice?.toString()
      });

      // Prepare deployment transaction
      const deployTransaction = await factory.getDeployTransaction();
      logger.info('Estimating gas for deployment...');
      
      // Set gas limits
      const baseGasLimit = BigInt(3000000);
      const gasBuffer = BigInt(500000);
      const totalGasLimit = baseGasLimit + gasBuffer;

      // Calculate total cost in POL
      const maxGasCost = totalGasLimit * (feeData.maxFeePerGas || BigInt(0));
      logger.info('Estimated maximum deployment cost in POL:', {
        maxGasCost: ethers.formatEther(maxGasCost),
        totalGasLimit: totalGasLimit.toString()
      });

      // Verify sufficient balance
      if (balance < maxGasCost) {
        throw new Error(`Insufficient POL balance. You need at least ${ethers.formatEther(maxGasCost)} POL for this transaction.`);
      }

      logger.info('Deploying contract with parameters:', {
        gasLimit: totalGasLimit.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      });

      // Deploy with explicit gas settings
      const contract = await factory.deploy({
        gasLimit: totalGasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      logger.info('Deployment transaction sent, waiting for confirmation...');
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      logger.info('Contract deployed successfully at:', { contractAddress });
      
      // Initialize the contract with property details
      const contractInstance = new ethers.Contract(
        contractAddress,
        PROPERTY_CONTRACT_ABI,
        signer
      );
      
      logger.info('Initializing contract...');
      const initTx = await contractInstance.initialize(propertyId, title, address, {
        gasLimit: BigInt(1000000),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      logger.info('Waiting for initialization transaction...');
      await initTx.wait();
      logger.info('Contract initialized successfully');

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
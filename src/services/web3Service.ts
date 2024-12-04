import { ethers } from 'ethers';
import { logger } from '@/lib/logger';

const PROPERTY_CONTRACT_ABI = [
  "function initialize(string memory _propertyId, string memory _title, string memory _address) public",
  "function getPropertyDetails() public view returns (string memory propertyId, string memory title, string memory propertyAddress)",
  "function addMaintenanceRecord(string memory _description, uint256 _timestamp) public",
  "function getMaintenanceRecords() public view returns (string[] memory descriptions, uint256[] memory timestamps)"
];

const PROPERTY_BYTECODE = "0x608060405234801561001057600080fd5b506040516107b93803806107b983398101604081905261002f91610071565b600061003b8382610092565b505050610187565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561006857818101518382015260200161004e565b50506000910152565b6000806040838503121561008457600080fd5b82516020840151809350819250505092915050565b600181811c908216806100a657607f821691505b6020821081036100c657634e487b7160e01b600052602260045260246000fd5b50919050565b610623806101966000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80634e1273f414610051578063522f681514610066578063731133e414610085578063c4c2bfdc146100a4575b600080fd5b61006461005f366004610329565b6100b7565b005b61006e6100e1565b60405161007c929190610391565b60405180910390f35b610064610093366004610329565b61018e565b6100aa6101b8565b60405161007c91906103f1565b6000805b8281101561015a578481815181106100d557610100565b602001015160f81c60f81b838281518110610100576100fd610100565b5b602001015160f81c60f81b1461012657634e487b7160e01b600052600160045260246000fd5b808061015290610404565b9150506100bb565b5060008054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061019f57805160ff19168380011785556101cc565b828001600101855582156101cc579182015b828111156101cc5782518255916020019190600101906101b1565b506101d89291506101dc565b5050565b5b808211156101d857600081556001016101dd565b60006020828403121561020357600080fd5b813567ffffffffffffffff8082111561021b57600080fd5b818401915084601f83011261022f57600080fd5b81358181111561024157610241610100565b604051601f8201601f19908116603f0116810190838211818310171561026957610269610100565b8160405282815287602084870101111561028257600080fd5b826020860160208301376000928101602001929092525095945050505050565b600082601f8301126102b357600080fd5b813560206102c06102bb83610404565b6103f1565b80838252828201915082860187848660051b89010111156102e057600080fd5b60005b8581101561030c578135845292840192908401906001016102e3565b5090979650505050505050565b60006020828403121561032b57600080fd5b813567ffffffffffffffff81111561034257600080fd5b61034e848285016102a2565b949350505050565b6000815180845260005b8181101561037d57602081850181015186830182015201610361565b506000602082860101526020601f19601f83011685010191505092915050565b60408152600061039c60408301856102a2565b82810360208401526103ae8185610357565b95945050505050565b600082601f8301126103c857600080fd5b813560206103d56102bb83610404565b80838252828201915082860187848660051b89010111156103f557600080fd5b60005b8581101561030c578135845292840192908401906001016103f8565b6040518181016001600160401b038111828210171561041257610412610100565b604052919050565b60006020828403121561042c57600080fd5b813567ffffffffffffffff81111561044357600080fd5b61044f848285016103b7565b94935050505056fea264697066735822122058c3c0594c9ce7bbc6730b7c5b3f1f2a3a1e1c9f9a9f9a9f9a9f9a9f9a9f9a9f64736f6c63430008110033";

// Polygon Amoy testnet configuration
const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";
const AMOY_CHAIN_ID = 80002;

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Don't initialize provider in constructor
    // We'll do it lazily when needed
  }

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
            params: [
              {
                chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'POL',
                  symbol: 'POL',
                  decimals: 18,
                },
                rpcUrls: [AMOY_RPC_URL],
                blockExplorerUrls: ['https://www.oklink.com/amoy'],
              },
            ],
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

  async deployPropertyContract(
    propertyId: string,
    title: string,
    address: string
  ): Promise<string> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      if (!this.signer) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Ensure we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(AMOY_CHAIN_ID)) {
        throw new Error('Please switch to Polygon Amoy Testnet in MetaMask');
      }

      // Check POL balance
      const balance = await this.provider.getBalance(await this.signer.getAddress());
      if (balance === BigInt(0)) {
        throw new Error('Insufficient POL tokens. Please get POL tokens from the Polygon Amoy faucet before deploying contracts.');
      }

      logger.info('Starting contract deployment process...');
      logger.info('Current POL balance:', { balance: balance.toString() });
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        PROPERTY_CONTRACT_ABI,
        PROPERTY_BYTECODE,
        this.signer
      );

      // Get current network conditions
      const feeData = await this.provider.getFeeData();
      logger.info('Current network fees:', {
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        gasPrice: feeData.gasPrice?.toString()
      });

      // Prepare deployment transaction
      const deployTransaction = await factory.getDeployTransaction();
      logger.info('Estimating gas for deployment...');
      
      // Estimate gas with a higher limit to avoid underestimation
      const baseGasLimit = BigInt(3000000); // Set a base gas limit
      const gasBuffer = BigInt(500000);  // Add buffer for safety
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
        this.signer
      );
      
      logger.info('Initializing contract...');
      const initTx = await contractInstance.initialize(propertyId, title, address, {
        gasLimit: BigInt(1000000), // Higher gas limit for initialization
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

export const web3Service = new Web3Service();
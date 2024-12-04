import { ethers } from 'ethers';

const PROPERTY_CONTRACT_ABI = [
  "function initialize(string memory _propertyId, string memory _title, string memory _address) public",
  "function getPropertyDetails() public view returns (string memory propertyId, string memory title, string memory propertyAddress)",
  "function addMaintenanceRecord(string memory _description, uint256 _timestamp) public",
  "function getMaintenanceRecords() public view returns (string[] memory descriptions, uint256[] memory timestamps)"
];

export class Web3Service {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.provider = new ethers.BrowserProvider(window.ethereum);
  }

  async connectWallet(): Promise<string> {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider.getSigner();
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async deployPropertyContract(
    propertyId: string,
    title: string,
    address: string
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const factory = new ethers.ContractFactory(
        PROPERTY_CONTRACT_ABI,
        PROPERTY_BYTECODE,
        this.signer
      );

      const contract = await factory.deploy();
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      
      // Initialize the contract with property details
      await contract.initialize(propertyId, title, address);

      return contractAddress;
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw new Error('Failed to deploy property contract');
    }
  }
}

// This would be replaced with actual bytecode from your compiled smart contract
const PROPERTY_BYTECODE = "0x..."; // You'll need to add your contract bytecode here

export const web3Service = new Web3Service();
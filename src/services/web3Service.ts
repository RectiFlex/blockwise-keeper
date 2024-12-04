import { providerService } from './web3/providerService';
import { deploymentService } from './web3/deploymentService';

export class Web3Service {
  async connectWallet(): Promise<string> {
    return providerService.connectWallet();
  }

  async deployPropertyContract(
    propertyId: string,
    title: string,
    address: string
  ): Promise<string> {
    return deploymentService.deployPropertyContract(propertyId, title, address);
  }
}

export const web3Service = new Web3Service();
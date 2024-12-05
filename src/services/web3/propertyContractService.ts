import { ethers } from 'ethers';
import { logger } from '@/lib/logger';
import { PROPERTY_CONTRACT_ABI } from './config';
import { providerService } from './providerService';

export class PropertyContractService {
  async getPropertyDetails(contractAddress: string) {
    try {
      const provider = await providerService.getProvider();
      const contract = new ethers.Contract(contractAddress, PROPERTY_CONTRACT_ABI, provider);
      
      const propertyId = 1; // First property ID since we only store one property per contract
      const details = await contract.getPropertyDetails(propertyId);
      
      return {
        owner: details[0],
        description: details[1],
        location: details[2]
      };
    } catch (error: any) {
      logger.error('Error getting property details:', error);
      throw new Error('Failed to fetch property details from the blockchain');
    }
  }

  async getMaintenanceRecords(contractAddress: string) {
    try {
      const provider = await providerService.getProvider();
      const contract = new ethers.Contract(contractAddress, PROPERTY_CONTRACT_ABI, provider);
      
      const propertyId = 1; // First property ID since we only store one property per contract
      const records = await contract.getMaintenanceRecords(propertyId);
      
      return records.map((record: any) => ({
        date: new Date(Number(record.date) * 1000),
        description: record.description,
        cost: Number(record.cost)
      }));
    } catch (error: any) {
      logger.error('Error getting maintenance records:', error);
      throw new Error('Failed to fetch maintenance records from the blockchain');
    }
  }

  async recordMaintenance(
    contractAddress: string,
    description: string,
    cost: number
  ) {
    try {
      const signer = await providerService.getSigner();
      const contract = new ethers.Contract(contractAddress, PROPERTY_CONTRACT_ABI, signer);
      
      const propertyId = 1; // First property ID since we only store one property per contract
      const tx = await contract.recordMaintenance(propertyId, description, cost);
      await tx.wait();
      
      logger.info('Maintenance record added successfully:', {
        contractAddress,
        description,
        cost
      });
    } catch (error: any) {
      logger.error('Error recording maintenance:', error);
      throw new Error('Failed to record maintenance on the blockchain');
    }
  }
}

export const propertyContractService = new PropertyContractService();
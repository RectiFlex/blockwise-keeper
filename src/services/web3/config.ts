import { ethers } from 'ethers';

// Polygon Amoy testnet configuration
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

// Property management contract ABI
export const PROPERTY_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "MaintenanceRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "propertyAddress",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "PropertyAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "addMaintenanceRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "propertyAddress",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "propertyOwner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "details",
        "type": "string"
      }
    ],
    "name": "addProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      }
    ],
    "name": "getMaintenanceRecords",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "date",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "cost",
            "type": "uint256"
          }
        ],
        "internalType": "struct PropertyManager.Maintenance[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      }
    ],
    "name": "getProperty",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "propertyAddress",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "details",
            "type": "string"
          }
        ],
        "internalType": "struct PropertyManager.Property",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract bytecode generated from the Solidity contract
export const PROPERTY_BYTECODE = "0x608060405234801561001057600080fd5b50610b0a806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806309c5eabe146100515780630d80fefd1461006d578063c41c2f24146100a0578063ee3def0e146100b9575b600080fd5b61006b60048036038101906100669190610779565b6100ec565b005b61008760048036038101906100829190610832565b61022b565b6040516100979493929190610934565b60405180910390f35b6100b860048036038101906100b391906109a0565b61035a565b005b6100d360048036038101906100ce9190610832565b610544565b6040516100e3949392919061099a565b60405180910390f35b6000600260008581526020019081526020016000208054905090506040518060600160405280858152602001848152602001838152506002600086815260200190815260200160002082908060018154018082558091505060019003906000526020600020906003020160009091909190915060008201518160000155602082015181600101908051906020019061018092919061064f565b50604082015181600201555050827f8e5f7438802738e3c8a848be958d004a50ea0e534bf2c40a6c4b6c4d524f4453858585856040516101c69493929190610934565b60405180910390a2505050505600a165627a7a72305820a3f0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0029";
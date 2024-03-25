require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PKEY1 = process.env.PKEY1
const INFURA_API_KEY = process.env.INFURA_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity:{
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      }
    }
  },
  networks: {
    'shimmer': {
      url: 'https://json-rpc.evm.testnet.shimmer.network',
      chainId: 1073,
      accounts: [PRIVATE_KEY, PKEY1],
    },
    'sepolia': {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
};

const { ethers } = require("hardhat");

/**
 * To verify the contract:
 * - deploy the contract 
 * - take note of the deployed address
 * - run: 
 *    npx hardhat verify --network <network_name> <deployed_address> <contructor_arguments>  
 */

async function main() {
    const [deployer] = await ethers.getSigners();
    //console.log("DEPLOYER: " + deployer);
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const Signature = await ethers.deployContract("Signature");
    console.log("Signature address:", await Signature.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
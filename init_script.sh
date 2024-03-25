#init script
#run this script to initialize the project for a smart contract


npm init -y

npm install --save-dev hardhat 
npx hardhat init
echo "hardhat OK"

npm install --save-dev @nomicfoundation/hardhat-toolbox
echo "hardhat-toolbox OK"

npm install dotenv --save
echo "dotenv OK"

npm install @openzeppelin/contracts
echo "openzeppelin/contracts OK"

#npm install --save-dev @nomiclabs/hardhat-ethers ethers
#echo "hardhat-ethers OK"

#npm install web3
#echo "web3 OK"

echo "require('@nomicfoundation/hardhat-toolbox');" | cat - hardhat.config.js > temp && mv temp hardhat.config.js

mkdir contracts scripts test
echo "Setup done"
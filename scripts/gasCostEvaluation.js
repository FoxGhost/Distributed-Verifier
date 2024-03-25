const fs = require('fs'); // Require the file system module for reading the file.
const { ethers } = require("hardhat");
const crypto = require('crypto'); 
let EC = require('elliptic').ec;
let iterationsNumber = 10;

async function myCostCheck(len, contract){
  const message = randomString(len)
  const msgHash = Buffer.from(crypto.createHash('sha256').update(message).digest('hex'), 'hex');

  const ec = new EC('p256');
  const key = ec.genKeyPair();

  const signature = key.sign(msgHash);

  const pubPoint = key.getPublic();
  let x = pubPoint.getX();
  x = BigInt("0x"+x.toString(16));

  let y = pubPoint.getY();
  y = BigInt("0x"+y.toString(16));

  let R = BigInt("0x"+signature.r.toString(16));
  let S = BigInt("0x"+signature.s.toString(16));

  const tx  = await contract.validateSignatureM(Buffer.from(message), R, S, x, y);
  //const tx  = await contract.validateSignatureH(Buffer.from(msgHash), R, S, x, y);
  const rc = await tx.wait();
  let event = rc.logs[0]
  console.log(event.eventName)
  console.log(event.args[0])
  console.log("Gas Used: " + rc.gasUsed)
  console.log("CumulativeGasUsed: " + rc.cumulativeGasUsed)
  
  return [rc.gasUsed, rc.cumulativeGasUsed]
}


function randomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function main(){

  const Signature = await ethers.getContractFactory('Signature');
    
  //shimmer
  //const myContract = await Signature.attach('0xf979a1AE46DD40137d2931f643C4F06657b0E25F');
  
  //shimmer with optimizer enable and 10000 runs
  //const myContract = await Signature.attach('0xAbB97C8928Fa9B263Ff15F19cc6D32CA4E866175');
  
  //shimmer with optimizer enable and 4294967295 runs
  //const myContract = await Signature.attach('0xB998379b7483bbeb34B814E0B2e8616D0Efc5519');
  
  //sepolia
  const myContract = await Signature.attach('0x349d04D160B45b839114C4B609997FDA340E9325');


  //console.log(await myContract.getAvaibleCurves());
  let tx = await myContract.getCurve("ECC_NIST_P256");


  let getCurveGasUsed = 0;
  let n = 0;

  for(let i = 0; i < 1; i++){
    let tx = await myContract.getCurve("ECC_NIST_P256");
    let rc = await tx.wait()
    let event = rc.logs[0]
    getCurveGasUsed += Number(rc.gasUsed);
    n++;
    
    console.log(n)
    console.log(event.eventName)
    console.log(event.args[0]+'\n')
  }
  
  console.log('getCurveGasUsed Total Gas Used', getCurveGasUsed);  
  console.log('getCurveGasUsed Mean Gas Used', Math.floor(getCurveGasUsed/n));
  console.log();

  let verifySignatureGasUsed = 0;
  //let cumulativeGasUsed = 0;
  n = 0;
  for(let i = 1024; i < 1025; i++){
    for (let j = 0; j < iterationsNumber; j++) {
      const [gu, cgu] = await myCostCheck(i, myContract);
      verifySignatureGasUsed += Number(gu);
      //cumulativeGasUsed += Number(cgu);
      n++;
      console.log(n, '\n');
    }
  }
  
/**
 *  cumulativeGasUsed : QUANTITY - The total amount of gas used when this transaction was executed in the block.
 *  gasUsed : QUANTITY - The amount of gas used by this specific transaction alone.
 */

  //console.log();
  //console.log('getCurve Total Gas Used', getCurveGasUsed);
  //console.log('getCurve Mean  Gas Used', Math.floor(getCurveGasUsed/n));
  console.log();
  console.log('verifySignature Total Gas Used', verifySignatureGasUsed);
  console.log('verifySignature Mean  Gas Used', Math.floor(verifySignatureGasUsed/n));
  console.log();
  //console.log('Total Cumulative Gas Used', cumulativeGasUsed);
  //console.log('Mean  Cumulative Gas Used', Math.floor(cumulativeGasUsed/n));


}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
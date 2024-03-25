const fs = require('fs'); // Require the file system module for reading the file.
const { ethers } = require("hardhat");
const crypto = require('crypto'); 
let EC = require('elliptic').ec;
let iterationsNumber = 1;

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
    
    const start = performance.now();

    const tx1  = await contract.validateSignatureM(Buffer.from(message), R, S, x, y);
    const tx2  = await contract.validateSignatureH(Buffer.from(msgHash), R, S, x, y);
    const tx3 = await contract.getCurve('ECC_NIST_P256');

    const rc1 = await tx1.wait();
    const rc2 = await tx2.wait();
    const rc3 = await tx3.wait();

    const end = performance.now();

    //let event = rc1.logs[0]
    //console.log(event.eventName)
    //console.log(event.args[0])
    
    return [Math.round(end-start)]
}

async function fixedLength(contract){
    let n = 0;
    let tTime = 0;
    for (let i = 0; i < iterationsNumber; i++) {
        const time = await myCostCheck(1024, contract);
        console.log(Number(time), typeof(Number(time)))
        console.log()
        tTime = Number(tTime) + Number(time);
        n++;
    }
    console.log('Mean elapsed time', Math.round(tTime/n))
    
}

async function variableLength(contract){
    let n = 0;
    let tTime = 0;
    for(let  j = 1024; j <= 1024*(2**6)+1; j=j*2){    
        for (let i = 0; i < iterationsNumber; i++) {
            const time = await myCostCheck(j, contract);
            //console.log(Number(time), typeof(Number(time)))
            tTime = Number(tTime) + Number(time);
            n++;
            //console.log(n)
        }
        console.log(j, 'Mean elapsed time: ', Math.round(tTime/n))
        n = 0;
        tTime = 0;
    }
    
}

async function main(){
    
    const Signature = await ethers.getContractFactory('Signature');
    //shimmer
    //const myContract = await Signature.attach('0xf979a1AE46DD40137d2931f643C4F06657b0E25F');
    //sepolia
    const myContract = await Signature.attach('0x349d04D160B45b839114C4B609997FDA340E9325');

    let tx = await myContract.getCurve('ECC_NIST_P256');

    //await fixedLength(myContract);
    await variableLength(myContract);
    
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
const { ethers } = require("hardhat");

function bigintToBytes(value) {
    if (value === 0n) {
        return new Uint8Array([0]);
    }

    let hexString = value.toString(16);
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }

    const bytes = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }

    return bytes;
}

async function main(){

    const Signature = await ethers.getContractFactory('Signature');
    //shimmer
    //const contract = await Signature.attach('0xf979a1AE46DD40137d2931f643C4F06657b0E25F');
    //sepolia
    const contract = await Signature.attach('0x349d04D160B45b839114C4B609997FDA340E9325');
  
  
    await contract.getCurve("ECC_NIST_P256");

    let message = "data to sign\n"

    /**
     * 
     * openssl ec -in private.ecc.pem -text -noout
        read EC key
        Private-Key: (256 bit)
            priv:
                57:db:7c:fc:a9:17:7c:14:d9:7c:3f:e1:f2:1d:fb:
                2a:85:04:fe:e0:05:6c:df:a3:47:56:0f:bb:40:e1:
                d0:1c
            pub:
                04:f2:e2:15:26:91:0c:82:d6:62:a8:5a:14:a1:0c:
                16:2d:7d:f4:ba:48:9e:f9:79:28:eb:00:a9:2b:71:
                ce:a6:22:12:c2:a9:82:fa:b6:32:9d:9f:bd:dd:82:
                fa:0a:a9:d4:9b:90:7c:b4:90:13:0c:f5:e2:5f:7c:
                2d:ae:be:fd:d6
        ASN1 OID: prime256v1
        NIST CURVE: P-256
     * 
     */

    let x = BigInt("0x"+"f2e21526910c82d662a85a14a10c162d7df4ba489ef97928eb00a92b71cea622");
    let y = BigInt("0x"+"12c2a982fab6329d9fbddd82fa0aa9d49b907cb490130cf5e25f7c2daebefdd6");
    //console.log("X: ", x.toString(16));
    //console.log("Y: ", y.toString(16));
    /**
     * openssl asn1parse -in data.out.signed -inform 
        der
            0:d=0  hl=2 l=  68 cons: SEQUENCE          
            2:d=1  hl=2 l=  32 prim: INTEGER:  4A8BDD7814669E17A7A74705F0415917575E1B2D3258C17CC87F6414F7469D3A
            36:d=1  hl=2 l=  32 prim: INTEGER: 3947324C0CBABB19CAE15A30EB35644155A1D9B25AD836AE60E296A2A215DE6A
     */

    let R = BigInt("0x"+"4A8BDD7814669E17A7A74705F0415917575E1B2D3258C17CC87F6414F7469D3A");
    let S = BigInt("0x"+"3947324C0CBABB19CAE15A30EB35644155A1D9B25AD836AE60E296A2A215DE6A");
                         
    //console.log("R: ", R.toString(16));
    //console.log("S: ", S.toString(16));

    /**
     * openssl dgst data.in.raw HASH GIUSTO
        SHA256(data.in.raw)= b39eaeb437e33087132f01c2abc60c6a16904ee3771cd7b0d622d01061b40729
     */    

    /**
     * HASH SBAGLIATO
     * sha256sum data.in.raw | awk '{ print "000000 " $1 }' | xxd -r -c 32 | hexdump 
        0000000 9eb3 b4ae e337 8730 2f13 c201 c6ab 6a0c
        0000010 9016 e34e 1c77 b0d7 22d6 10d0 b461 2907
        0000020
     */

    let msgHash = bigintToBytes(BigInt("0x"+"b39eaeb437e33087132f01c2abc60c6a16904ee3771cd7b0d622d01061b40729"))
    //const bytes32 = ethers.utils.arrayify("0x" + msgHash);
    //console.log("Hash :", msgHash);
    //console.log("Bytes32 Format:", bytes32);
      
    //const tx  = await contract.validateSignatureM(Buffer.from(message), R, S, x, y);
    const tx  = await contract.validateSignatureH(msgHash, R, S, x, y);
    const rc = await tx.wait();
    
    //console.log(rc);
    
    let event = rc.logs[0]
    console.log(event.eventName)
    console.log(event.args[0])  
  
  }

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
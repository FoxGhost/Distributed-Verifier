// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

struct Curve{
  string curveID;
  uint p;
  uint a;
  uint b;
  uint Gx;
  uint Gy;
  uint n;
  uint h_cofactor;
}

contract Curves {

  Curve ECC_NIST_P256 = Curve(
    "ECC_NIST_P256", //curveID
    0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff, //p
    0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc, //a
    0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b, //b
    0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296, //Gx
    0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5, //Gy
    0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551, //n
    0x1 //h cofactor
  );

  Curve ECC_BN_P256 = Curve(
    "ECC_BN_P256",
    0xFFFFFFFFFFFCF0CD46E5F25EEE71A49F0CDC65FB12980A82D3292DDBAED33013, //p
    0x0, //a
    0x3, //b
    0x1, //Gx
    0x2, //Gy
    0xFFFFFFFFFFFCF0CD46E5F25EEE71A49E0CDC65FB1299921AF62D536CD10B500D, //n
    0x1 //h cofactor
  );

  Curve SECP256K1 = Curve(
    "SECP256K1",
    0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f, //p
    0x0000000000000000000000000000000000000000000000000000000000000000, //a
    0x0000000000000000000000000000000000000000000000000000000000000007, //b
    0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798, //Gx
    0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8, //Gy
    0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141, //n
    0x1 //h
  );

  mapping(string => Curve) private curveList;
  string[] public curveListID;

  constructor(){
    curveListID.push('ECC_NIST_P256');
    addCurve(ECC_NIST_P256);

    curveListID.push('ECC_BN_P256');
    addCurve(ECC_BN_P256);

    curveListID.push('SECP256K1');
    addCurve(SECP256K1);
  }

  function getCurveParams(string calldata curveID) public view returns (Curve memory) {
    return curveList[curveID];
  }

  function addCurve(Curve memory newCurve) private {
      curveList[newCurve.curveID] = newCurve;
  }    

}
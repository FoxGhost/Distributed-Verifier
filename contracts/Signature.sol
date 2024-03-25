// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ECmath.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./Curves.sol";

/**
 * @title Elliptic Curve Operations Library
 * This is a library for operations on ECC curves
 * @author FoxGhost 
 */

contract Signature is ECmath, Curves {

    string private curveID;
    uint private a;
    uint private b;
    uint private Gx;
    uint private Gy;
    uint private p;
    uint private n;
    uint private h_cofactor;

    /**
     * List all the avaiables curves where to compute a signature verification
     */
    function getAvaibleCurves() external view returns(string [] memory){ 
        return curveListID;
        //return "ECC_NIST_P256 \nECC_BN_P256\nSECP256K1";
    }
    
    event CurveSetted(string _curveID);
    /**
     * Set the desired curve where to validate a signature 
     * @param ID - id that identifies a curve, obtain one through getAvaibleCurves()
     */
    function getCurve(string calldata ID) external {
        Curve memory curve = getCurveParams(ID);
        curveID = curve.curveID;
        p = curve.p;
        a = curve.a;
        b = curve.b;
        Gx = curve.Gx;
        Gy = curve.Gy;
        n = curve.n;
        h_cofactor = curve.h_cofactor;
        
        emit CurveSetted(curveID);
        //return curve;
        //return p;
    }

    /**
     * @dev addition between two points
     * checks that points are on the curve
     * @param x and y coordinates of the two points x1, y1, x2, y2
     * @return x and y of the point sum
     */
    function addPoints(uint256 x1, uint256 y1, uint256 x2, uint256 y2) internal view returns(uint256 x, uint256 y){
        require(isOnCurve(x1, y1, a, b, p) && isOnCurve(x2, y2, a, b, p), "Points not on curve");
        (x, y) = ecAdd(x1, y1, x2, y2, a, p);
        require(isOnCurve(x, y, a, b, p), "Point not on curve");
        return (x,y);
    }

    /**
     * 
     * @param  s - scalar
     * @param xp - x coordinate of the point to multiply 
     * @param yp - y coordinate of the point to multiply 
     * @return x - this is the result 
     * @return y - this is the result
     */
    function scalarMul(uint256 s, uint256 xp, uint256 yp) internal view returns(uint256 x, uint256 y){
        require(isOnCurve(xp, yp, a, b, p), "Point not on curve");
        (x, y) = ecMul(s, xp, yp, a, p);
        require(isOnCurve(x, y, a, b, p), "Point not on curve");
        return (x,y);
    }

    /**
     * @dev only, use it just for testing purposes 
     * NEVER send private key to a smart contract or they'll becomes public
     * Compute the public key from a private key
     * checks about the existence of the point already performed in scalarMul()
     * @param privK private key
     * @return pubKx x component of the public key
     * @return pubKy y component of the public key
     */
    function computePublicKey(uint256 privK) external view returns (uint256 pubKx, uint256 pubKy){
        (pubKx, pubKy) = scalarMul(privK, Gx, Gy);
    }

    event CorrectSignature(bool returnValue);
    event WrongSignature(bool returnValue);

    /**
     * 
     * @param h - hash of the message
     * @param r - r param of the signature
     * @param s - s param of the signature
     * @param pubKx - x component of PublicKey
     * @param pubKy - y component of PublicKey 
     * 
     * Validation algorithm:
     * 
     * w = s^(-1) = (h + r PrivK)^(-1) * k mod n
     * u = w * h mod n
     * v = w * r mod n
     * Q = uG + vPubK
     * 
     * if Qx mod n == r
     *  true 
     */
    function validateSignatureH(
        bytes32 h, 
        uint256 r, 
        uint256 s, 
        uint256 pubKx, 
        uint256 pubKy
        ) 
        external 
    {
        
        /*
            //if(r == 0 || r >= n || s == 0 || s > lowSmax, "Signature not valid");
            require(r != 0, "R = 0");
            require(r < n, 'R >= n');
            require(s != 0, "S = 0");
            require(s < n, "S > lowSmax");
        }
        */

        
        require(r != 0 && s != 0 && r < n && s < n, "Signature not valid");
        require(isOnCurve(pubKx, pubKy, a, b, p), "Public key not valid");

        uint256 w = invMod(s, n);
        uint256 u = mulmod(w, uint256(h), n);
        uint256 v = mulmod(w, r, n);
        
        (uint256 uGx, uint256 uGy)  = scalarMul(u, Gx, Gy); 
        (uint256 vPubKx, uint256 vPubKy) = scalarMul(v, pubKx, pubKy);

        (uint256 Qx, ) = addPoints(uGx, uGy, vPubKx, vPubKy);

        Qx = Qx % n;

        if(Qx == r)
            emit CorrectSignature(true);
            //return true;
        else
            emit WrongSignature(false);
            //return false;
        
    }

    /**
     * 
     * @param m - message
     * @param r - r param of the signature
     * @param s - s param of the signature
     * @param pubKx - x component of PublicKey
     * @param pubKy - y component of PublicKey 
     * 
     * Validation algorithm:
     * 
     * w = s^(-1) = (h + r PrivK)^(-1) * k mod n
     * u = w * h mod n
     * v = w * r mod n
     * Q = uG + vPubK
     * 
     * if Qx mod n == r
     *  true 
     */
    function validateSignatureM(
        bytes calldata m, 
        uint256 r, uint256 s, 
        uint256 pubKx, 
        uint256 pubKy
        ) 
        external
    {
        
        require(r != 0 && s != 0 && r < n && s < n, "Signature not valid");
        require(isOnCurve(pubKx, pubKy, a, b, p), "Public key not valid");

        bytes32 h = sha256(m);

        uint256 w = invMod(s, n);
        uint256 u = mulmod(w, uint256(h), n);
        uint256 v = mulmod(w, r, n);
        
        (uint256 uGx, uint256 uGy)  = scalarMul(u, Gx, Gy); 
        (uint256 vPubKx, uint256 vPubKy) = scalarMul(v, pubKx, pubKy);

        (uint256 Qx, ) = addPoints(uGx, uGy, vPubKx, vPubKy);

        Qx = Qx % n;

        if(Qx == r)
            emit CorrectSignature(true);
        else
            emit WrongSignature(false);
        
    }   
}
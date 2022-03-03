// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "../../DropStarERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PrimarySaleOrchestrator is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    mapping(bytes32 => bool) public hashUsed;

    constructor() {}

    function fulfillBid(
        address _tokenAddress,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public payable {
        DropStarERC1155 tokenContract = DropStarERC1155(_tokenAddress);

        //require(tokenContract.isApprovedForAll(_holderAddress, address(this)));

        //require(_bidWinner == msg.sender);
    }

    function doHash(address _tokenAddress, uint256 _tokenId)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_tokenAddress, _tokenId));
    }

    function recover(
        bytes32 _message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        bytes32 ethHash = _message.toEthSignedMessageHash();
        return ethHash.recover(v, r, s);
    }
}

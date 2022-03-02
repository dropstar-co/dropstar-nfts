// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "../../DropStarERC1155.sol";

contract PrimarySaleOrchestrator is Ownable {
    using SafeMath for uint256;

    mapping(bytes32 => bool) public hashUsed;

    constructor() {}

    function fulfillBid(
        address _tokenAddress,
        uint256 _tokenId,
        address _holderAddress,
        address _price,
        address _bidWinner,
        bytes32 _signature
    ) public payable {
        DropStarERC1155 tokenContract = DropStarERC1155(_tokenAddress);

        require(tokenContract.isApprovedForAll(_holderAddress, address(this)));

        require(_bidWinner == msg.sender);
    }
}

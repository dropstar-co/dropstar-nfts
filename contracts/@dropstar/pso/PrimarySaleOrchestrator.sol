// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "../../DropStarERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract PrimarySaleOrchestrator is Ownable, EIP712 {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    mapping(bytes32 => bool) public hashUsed;

    constructor() EIP712("DropStar", "1.0.0") {}

    function fulfillBid(
        address _tokenAddress,
        uint256 _tokenId,
        address _holder,
        uint256 _price,
        address _bidWinner,
        address payable _paymentRecipient,
        uint256 _startDate,
        uint256 _deadline,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public payable {
        DropStarERC1155 nft = DropStarERC1155(_tokenAddress);

        require(nft.isApprovedForAll(_holder, address(this)), "ERR1");

        require(msg.value >= _price, "ERR2");

        uint256[] memory tokenIds = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);

        tokenIds[0] = _tokenId;
        amounts[0] = 1;

        require(_bidWinner == msg.sender, "ERR3");

        (bool sent, bytes memory data) = _paymentRecipient.call{
            value: msg.value
        }("");
        require(sent, "ERR4");

        nft.safeBatchTransferFrom(
            _holder,
            _bidWinner,
            tokenIds,
            amounts,
            "0x00"
        );
    }

    function doHash(
        address _tokenAddress,
        uint256 _tokenId,
        address _holderAddress,
        uint256 _price,
        address _bidWinner,
        address _paymentRecipient,
        uint256 _startDate,
        uint256 _deadline
    ) external pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _tokenAddress,
                    _tokenId,
                    _holderAddress,
                    _price,
                    _bidWinner,
                    _paymentRecipient,
                    _startDate,
                    _deadline
                )
            );
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

    /*
    Which function is called, fallback() or receive()?

           send Ether
               |
         msg.data is empty?
              / \
            yes  no
            /     \
receive() exists?  fallback()
         /   \
        yes   no
        /      \
    receive()   fallback()
    */

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        revert("ERR0");
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        revert("ERR0");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

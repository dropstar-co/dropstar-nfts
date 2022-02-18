// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./@dropstar/royalties/impl/DropStarERC1155withRoyaltyImpl.sol";

contract DropStarERC1155 is DropStarERC1155withRoyaltyImpl {

    using SafeMath for uint256;

    constructor(string memory metadataURI) ERC1155(metadataURI){
        bytes memory data = "\x00";  // you can extend this
        _mint(msg.sender, 0, 10, data);
    }

    function mint(address to,uint256 tokenId,uint256 amount, string memory newuri, bytes memory data) public onlyOwner{
        _mint(to, tokenId, amount, data);
        _setURI(newuri);
    }

    function burn(address from, uint256 tokenId, uint256 amount) public {
        require(balanceOf(msg.sender, tokenId) >= amount);
        _burn(from, tokenId, amount);
    }
}
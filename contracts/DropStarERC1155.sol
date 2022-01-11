// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./@dropstar/royalties/impl/DropStarERC1155withRoyaltyImpl.sol";

contract DropStarERC1155 is DropStarERC1155withRoyaltyImpl{

    using SafeMath for uint256;

    constructor() ERC1155("https://ipfs.io/ipfs/QmceUTvLxgX34pLKgBCFJUiqABTVFoC6Btef68ke2i4hus/{id}"){
        bytes memory data = "\x00";  // you can extend this
        _mint(msg.sender, 0, 10, data);
    }

    function mint(address to,uint256 id,uint256 amount,bytes memory data) public onlyOwner{
        _mint(to, id, amount, data);
    }

    function burn(address from, uint256 id, uint256 amount) public {
        require(balanceOf(msg.sender, id) >= amount);
        _burn(from, id, amount);
    }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DropStarERC721 is ERC721 {
    constructor() ERC721("Age of Smart Machine", "AoSM") {
        _mint(msg.sender, 0);
    }
}

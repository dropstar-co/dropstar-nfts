// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./DropStarERC1155withRoyaltyImpl.sol";

abstract contract  MultiURIERC1155 {

    mapping(uint256 => string) URIs;

    function _setURI(uint256 tokenId, string memory newuri) internal{
        URIs[tokenId] = newuri;
    }

    function _uri(uint256 tokenId) public view returns(string memory) {
        return URIs[tokenId];
    }
}
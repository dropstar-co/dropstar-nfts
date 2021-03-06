// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface DropStarERC1155withGatedContent {
    /**
     * Retrieves the list of gatd content uris for each token.
     */
    function getURIGatedContent(uint256 _tokenId)
        external
        view
        returns (string[] memory);

    /**
     *
     */
    function setURIGatedContent(
        uint256 _tokenId,
        string[] memory _uriGatedContent
    ) external;

    event GatedContentURIsChanged(uint256 _tokenId, string[] _uriGatedContent);
}

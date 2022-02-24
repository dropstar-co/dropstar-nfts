// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../../@rarible/royalties/LibPart.sol";
import "../../../@rarible/royalties/LibRoyaltiesV2.sol";
import "../../../@rarible/royalties/impl/RoyaltiesV2Impl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../DropStarERC1155withGatedContent.sol";

abstract contract DropStarERC1155withGatedContentImpl is
    ERC1155,
    DropStarERC1155withGatedContent
{
    using SafeMath for uint256;

    mapping(uint256 => string) private gatedContentURIs;

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, IERC165)
        returns (bool)
    {
        return
            interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES
                ? true
                : super.supportsInterface(interfaceId);
    }

    function getURIGatedContent(uint256 _tokenId)
        external
        view
        override(DropStarERC1155withGatedContent)
        returns (string[] memory)
    {}

    function setURIGatedContent(
        uint256 _tokenId,
        string[] memory _uriGatedContent
    ) external view override(DropStarERC1155withGatedContent) {}
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../../@rarible/royalties/LibPart.sol";
import "../../../@rarible/royalties/LibRoyaltiesV2.sol";
import "../../../@rarible/royalties/impl/RoyaltiesV2Impl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

abstract contract DropStarERC1155withRoyaltyImpl is RoyaltiesV2Impl, IERC2981 {
    using SafeMath for uint256;

    /// ERC165 bytes to add to interface array - set in parent contract
    /// implementing this standard
    ///
    /// bytes4(keccak256("royaltyInfo(uint256,uint256)")) == 0x2a55205a
    /// bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
    /// _registerInterface(_INTERFACE_ID_ERC2981);

    /// @notice Called with the sale price to determine how much royalty
    //          is owed and to whom.
    /// @param _tokenId - the NFT asset queried for royalty information
    /// @param _salePrice - the sale price of the NFT asset specified by _tokenId
    /// @return receiver - address of who should be sent the royalty payment
    /// @return royaltyAmount - the royalty payment amount for _salePrice
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override(IERC2981)
        returns (address receiver, uint256 royaltyAmount)
    {
        LibPart.Part[] memory _raribleRoyalty = getRaribleV2Royalties(_tokenId);

        if (_raribleRoyalty.length == 0) return (address(0), 0);
        else
            return (
                _raribleRoyalty[0].account,
                _salePrice.mul(_raribleRoyalty[0].value).div(10000)
            );
    }

    function _setRoyalties(
        uint256 _tokenId,
        address payable _royaltiesRecipientAddress,
        uint96 _percentageBasisPoints
    ) internal {
        LibPart.Part[] memory _royalties = new LibPart.Part[](1);
        _royalties[0].value = _percentageBasisPoints;
        _royalties[0].account = _royaltiesRecipientAddress;
        _setRoyalties(_tokenId, _royalties);

        emit RoyaltyRecipientChanged(
            _tokenId,
            _royaltiesRecipientAddress,
            _percentageBasisPoints
        );
    }

    event RoyaltyRecipientChanged(
        uint256 _tokenId,
        address indexed _royaltiesRecipientAddress,
        uint96 _percentageBasisPoints
    );
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./@rarible/royalties/LibRoyaltiesV2.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./@dropstar/royalties/impl/DropStarERC1155withRoyaltyImpl.sol";
import "./@dropstar/content/impl/DropStarERC1155withGatedContentImpl.sol";

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";

contract DropStarERC1155 is
    ERC1155Pausable,
    ERC1155Supply,
    AccessControlEnumerable,
    DropStarERC1155withRoyaltyImpl,
    DropStarERC1155withGatedContentImpl
{
    using SafeMath for uint256;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory _uriConstructor) ERC1155(_uriConstructor) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setURI(string memory newuri)
        external
        onlyRole(URI_SETTER_ROLE)
        whenNotPaused
    {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mintBatch(to, ids, amounts, data);
    }

    function setURIGatedContent(
        uint256 _tokenId,
        string[] memory _uriGatedContent
    )
        external
        override(DropStarERC1155withGatedContent)
        onlyRole(URI_SETTER_ROLE)
        whenNotPaused
    {
        _setURIGatedContent(_tokenId, _uriGatedContent);
    }

    function setRoyalties(
        uint256 _tokenId,
        address payable _royaltiesRecipientAddress,
        uint96 _percentageBasisPoints
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _setRoyalties(
            _tokenId,
            _royaltiesRecipientAddress,
            _percentageBasisPoints
        );
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControlEnumerable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(ERC1155Supply).interfaceId ||
            interfaceId == type(AccessControl).interfaceId ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155Supply, ERC1155Pausable) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}

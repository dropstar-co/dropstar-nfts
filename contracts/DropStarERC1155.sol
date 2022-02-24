// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./@dropstar/royalties/DropStarERC1155withRoyalty.sol";
import "./@dropstar/royalties/impl/DropStarERC1155withRoyaltyImpl.sol";

import "./@dropstar/content/DropStarERC1155withGatedContent.sol";
import "./@dropstar/content/impl/DropStarERC1155withGatedContentImpl.sol";

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract DropStarERC1155 is
    ERC1155Supply,
    DropStarERC1155withRoyaltyImpl,
    DropStarERC1155withGatedContentImpl,
    AccessControlEnumerable
{
    using SafeMath for uint256;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            DropStarERC1155withRoyaltyImpl,
            DropStarERC1155withGatedContentImpl,
            ERC1155,
            AccessControlEnumerable
        )
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(ERC1155Supply).interfaceId ||
            interfaceId == type(AccessControl).interfaceId ||
            interfaceId == type(DropStarERC1155withGatedContent).interfaceId ||
            interfaceId == type(DropStarERC1155withRoyalty).interfaceId ||
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
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}

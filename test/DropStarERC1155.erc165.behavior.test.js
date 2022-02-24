const { expect } = require('chai')

const { shouldSupportInterfaces } = require('./SupportsInterface.behavior')

const DropStarERC1155_truffle5 = artifacts.require('DropStarERC1155')

contract('DropStarERC1155', function (accounts) {
  const [deployer] = accounts

  beforeEach(async function () {
    this.mock = await DropStarERC1155_truffle5.new({
      from: deployer,
    })
  })

  shouldSupportInterfaces([
    'AccessControl',
    'AccessControlEnumerable',
    'ERC2981',
    'ERC1155',
    'DropStarERC1155withGatedContent',
    'DropStarERC1155withRoyalty',
  ])
})

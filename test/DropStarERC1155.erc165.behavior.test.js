const { expect } = require('chai')

const { shouldSupportInterfaces } = require('./SupportsInterface.behavior')

const DropStarERC1155_truffle5 = artifacts.require('DropStarERC1155')

const { BN, soliditySha3 } = require('web3-utils')

console.log({ soliditySha3 })

contract('DropStarERC1155', function (accounts) {
  const [deployer] = accounts

  beforeEach(async function () {
    this.mock = await DropStarERC1155_truffle5.new({
      from: deployer,
    })
  })

  shouldSupportInterfaces(['AccessControl', 'IERC2981', 'ERC1155'])
})

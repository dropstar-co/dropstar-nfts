const { expect } = require('chai')
const { ethers } = require('hardhat')

const DATA = '0x00'

describe('DropStarERC1155 gated content capabilities', function () {
  it('Should exist when deployed', async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()

    await dropStarERC1155.uri(0)
  })

  it('Should be able to get/set uri for public metadata', async function () {
    const [deployer, uriSetter, other] = await ethers.getSigners()
    const newURI = 'http://testdomain.com/testplace/{id}'

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()

    const URI_SETTER_ROLE = await dropStarERC1155.URI_SETTER_ROLE()

    await dropStarERC1155.deployed()

    const grantRoleTx = dropStarERC1155.grantRole(
      URI_SETTER_ROLE,
      uriSetter.address,
    )
    await expect(grantRoleTx)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(URI_SETTER_ROLE, uriSetter.address, deployer.address)

    await dropStarERC1155.setURI(newURI)
    await dropStarERC1155.connect(uriSetter).setURI(newURI)
    await expect(dropStarERC1155.connect(other).setURI(newURI)).reverted
  })

  it('Should be able to get/set uri per tokenID', async function () {
    const [deployer, uriSetter] = await ethers.getSigners()
    const tokenId = 0

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()

    const URI_SETTER_ROLE = await dropStarERC1155.URI_SETTER_ROLE()

    await dropStarERC1155.deployed()

    const grantRoleTx = dropStarERC1155.grantRole(
      URI_SETTER_ROLE,
      uriSetter.address,
    )
    await expect(grantRoleTx)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(URI_SETTER_ROLE, uriSetter.address, deployer.address)

    await dropStarERC1155.setURIGatedContent(tokenId, [
      'asdf1',
      'asdf2',
      'asdf3',
    ])
  })
})

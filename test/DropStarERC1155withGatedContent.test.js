const { expect } = require('chai')
const { ethers } = require('hardhat')

const DATA = '0x00'
const MOCK_URI = 'mockURI'

describe('DropStarERC1155 gated content capabilities', function () {
  let DropStarERC1155, dropStarERC1155
  let deployer, admin, uriSetter, other

  let publicMetadataURI
  let tokenID, tokenGatedContentURIs
  let URI_SETTER_ROLE

  beforeEach(async function () {
    DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy(MOCK_URI)

    this.mock = dropStarERC1155
    ;[deployer, admin, uriSetter, other] = await ethers.getSigners()

    tokenIDs = [0, 1, 2]
    tokenAmounts = [1, 10, 20]

    tokenID = 0
    publicMetadataURI = 'http://mycontentsite.extension/path/{id}'
    tokenGatedContentURIs = [
      'http://mycontentsite.extension/path/asdf1',
      'http://mycontentsite.extension/path/asdf2',
      'http://mycontentsite.extension/path/asdf3',
    ]
    URI_SETTER_ROLE = await dropStarERC1155.URI_SETTER_ROLE()
  })

  it('Should exist when deployed', async function () {
    await dropStarERC1155.deployed()
    await dropStarERC1155.uri(0)
  })

  it('Should be able to get/set uri of metadata', async function () {
    const grantRoleTx = dropStarERC1155.grantRole(
      URI_SETTER_ROLE,
      uriSetter.address,
    )

    await expect(grantRoleTx)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(URI_SETTER_ROLE, uriSetter.address, deployer.address)

    await dropStarERC1155.setURI(publicMetadataURI)
    await dropStarERC1155.connect(uriSetter).setURI(publicMetadataURI)
    await expect(dropStarERC1155.connect(other).setURI(publicMetadataURI))
      .reverted
  })

  it('Should be able to get/set uri of gated content per tokenID', async function () {
    const grantRoleTx = dropStarERC1155.grantRole(
      URI_SETTER_ROLE,
      uriSetter.address,
    )
    await expect(grantRoleTx)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(URI_SETTER_ROLE, uriSetter.address, deployer.address)

    await dropStarERC1155.setURIGatedContent(tokenID, tokenGatedContentURIs)

    const gatedContentURIsReceived = await dropStarERC1155.getURIGatedContent(
      tokenID,
    )

    expect(gatedContentURIsReceived).to.have.length(
      tokenGatedContentURIs.length,
    )
    expect(gatedContentURIsReceived[0]).to.equal(tokenGatedContentURIs[0])
    expect(gatedContentURIsReceived[1]).to.equal(tokenGatedContentURIs[1])
    expect(gatedContentURIsReceived[2]).to.equal(tokenGatedContentURIs[2])
  })

  it('Should have no gated content when it is not set', async function () {
    const gatedContentURIsReceived = await dropStarERC1155.getURIGatedContent(
      tokenID,
    )

    expect(gatedContentURIsReceived).to.have.length(0)
  })

  it('Should have no gated content when a token is set but not the specified one', async function () {
    const grantRoleTx = dropStarERC1155.grantRole(
      URI_SETTER_ROLE,
      uriSetter.address,
    )
    await expect(grantRoleTx)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(URI_SETTER_ROLE, uriSetter.address, deployer.address)

    await dropStarERC1155.setURIGatedContent(tokenID, tokenGatedContentURIs)

    const gatedContentURIsReceived = await dropStarERC1155.getURIGatedContent(
      tokenID + 1,
    )

    expect(gatedContentURIsReceived).to.have.length(0)
  })
})

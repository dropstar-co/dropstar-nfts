const { expect } = require('chai')
const { ethers } = require('hardhat')
const { parseUnits } = ethers.utils

const DATA = '0x00'
const MOCK_URI = 'mockURI'

describe('DropStarERC1155', function () {
  let DropStarERC1155, dropStarERC1155
  let deployer, admin, minter, other
  let MINTER_ROLE
  let tokenID, tokenAmount
  let tokenIDs, tokenAmounts

  const otherMissingURISetterRoleRevert =
    'AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'

  beforeEach(async function () {
    DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy(MOCK_URI)
    await dropStarERC1155.deployed()

    this.mock = dropStarERC1155
    ;[deployer, admin, minter, other] = await ethers.getSigners()

    MINTER_ROLE = await dropStarERC1155.MINTER_ROLE()

    tokenIDs = [0, 1, 2]
    tokenAmounts = [1, 10, 20]

    tokenID = 0
    tokenAmount = 1
  })

  it('Should exist when deployed', async function () {
    await dropStarERC1155.uri(0)
  })

  it('Should return a 10% royalty with royaltyInfo', async function () {
    const tokenID = 0
    const amount = 1
    const salePrice = 100
    const royaltyAmountExpected = '10'
    const royaltyPercentPoints = 10 * 100
    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)
    await dropStarERC1155.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const result = await dropStarERC1155.royaltyInfo(tokenID, salePrice)

    expect(result.royaltyAmount.toString()).to.equal(royaltyAmountExpected)
  })

  it('Should return a 25% royalty with royaltyInfo', async function () {
    const tokenID = 0
    const amount = 1
    const salePrice = 20000
    const royaltyAmountExpected = Math.round(20000 * 0.025).toString()
    const royaltyPercentPoints = 2.5 * 100
    const expectedRoyaltyPercentPoints = (2.5 * 100).toString()
    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)
    await dropStarERC1155.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const resultEIP2981 = await dropStarERC1155.royaltyInfo(tokenID, salePrice)

    expect(resultEIP2981.royaltyAmount.toString()).to.equal(
      royaltyAmountExpected,
    )

    const resultRaribleV2Royalties =
      await dropStarERC1155.getRaribleV2Royalties(tokenID)

    expect(resultRaribleV2Royalties).to.be.an('array').of.lengthOf(1)
    expect(resultRaribleV2Royalties[0]).to.have.property('value')
    expect(resultRaribleV2Royalties[0]).to.have.property('account')

    expect(resultRaribleV2Royalties[0].account).to.equal(deployer.address)
    expect(resultRaribleV2Royalties[0].value.toString()).to.equal(
      expectedRoyaltyPercentPoints,
    )
  })

  it('Should return a 33% royalty with getRaribleV2Royalties', async function () {
    const tokenID = 0
    const amount = 1

    const expectedRoyaltyPercentPoints = (33 * 100).toString()
    const royaltyPercentPoints = 33 * 100
    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)
    await dropStarERC1155.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const result = await dropStarERC1155.getRaribleV2Royalties(tokenID)

    expect(result).to.be.an('array').of.lengthOf(1)
    expect(result[0]).to.have.property('value')
    expect(result[0]).to.have.property('account')

    expect(result[0].account).to.equal(deployer.address)
    expect(result[0].value.toString()).to.equal(expectedRoyaltyPercentPoints)
  })

  it('Should not fail calling getRaribleV2Royalties when royalties are empty', async function () {
    const tokenID = 0
    const amount = 1

    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)

    const raribleV2Royalties = await dropStarERC1155.getRaribleV2Royalties(
      tokenID,
    )

    expect(raribleV2Royalties).to.be.an('array').of.lengthOf(0)
  })

  it('Should not fail calling royaltyInfo when royalties are empty', async function () {
    const tokenID = 0
    const amount = 1

    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)

    const royaltyInfo = await dropStarERC1155.royaltyInfo(
      tokenID,
      parseUnits('100', 'ether'),
    )

    expect(royaltyInfo[0]).to.equal(ethers.constants.AddressZero)
    expect(royaltyInfo[1]).to.equal('0')
  })

  it('Should update royalties properly', async function () {
    const tokenID = 0
    const amount = 1
    const salePrice = parseUnits('100', 'ether')

    const expectedRoyaltyPercentPoints = (33 * 100).toString()
    const royaltyPercentPoints = 33 * 100
    await dropStarERC1155.mint(deployer.address, tokenID, amount, DATA)
    await dropStarERC1155.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )

    const resultRaribleV2Royalties =
      await dropStarERC1155.getRaribleV2Royalties(tokenID)

    const resultRoyaltyInfo = await dropStarERC1155.royaltyInfo(
      tokenID,
      salePrice,
    )

    console.log({
      resultRaribleV2Royalties,
      resultRoyaltyInfo,
    })

    expect(resultRaribleV2Royalties).to.be.an('array').of.lengthOf(1)
    expect(resultRaribleV2Royalties[0]).to.have.property('value')
    expect(resultRaribleV2Royalties[0]).to.have.property('account')

    expect(resultRaribleV2Royalties[0].account).to.equal(deployer.address)
    expect(resultRaribleV2Royalties[0].value.toString()).to.equal(
      expectedRoyaltyPercentPoints,
    )

    const expectedRoyaltyPercentPoints2 = (55 * 100).toString()
    const royaltyPercentPoints2 = 55 * 100
    await dropStarERC1155.setRoyalties(
      tokenID,
      other.address,
      royaltyPercentPoints2,
    )

    const resultRaribleV2Royalties2 =
      await dropStarERC1155.getRaribleV2Royalties(tokenID)

    const resultRoyaltyInfo2 = await dropStarERC1155.royaltyInfo(
      tokenID,
      salePrice,
    )

    console.log({ resultRaribleV2Royalties2, resultRoyaltyInfo2 })

    expect(resultRaribleV2Royalties2).to.be.an('array').of.lengthOf(1)
    expect(resultRaribleV2Royalties2[0]).to.have.property('value')
    expect(resultRaribleV2Royalties2[0]).to.have.property('account')

    expect(resultRaribleV2Royalties2[0].account).to.equal(other.address)
    expect(resultRaribleV2Royalties2[0].value.toString()).to.equal(
      expectedRoyaltyPercentPoints2,
    )
  })
})

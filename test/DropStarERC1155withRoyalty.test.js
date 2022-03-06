const { expect } = require('chai')
const { ethers } = require('hardhat')
const { parseUnits } = ethers.utils

describe('DropStarERC1155', function () {
  it('Should exist when deployed', async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()

    await dropStarERC1155.uri(0)
  })

  it('Should return a 10% royalty with royaltyInfo', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'
    const salePrice = 100
    const royaltyAmountExpected = '10'
    const royaltyPercentPoints = 10 * 100
    await dropStarERC1155.mint(deployer.address, tokenID, amount, calldata)
    await dropStarERC1155.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const result = await dropStarERC1155.royaltyInfo(tokenID, salePrice)

    expect(result.royaltyAmount.toString()).to.equal(royaltyAmountExpected)
  })

  it('Should return a 33% royalty with getRaribleV2Royalties', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'

    const expectedRoyaltyPercentPoints = (33 * 100).toString()
    const royaltyPercentPoints = 33 * 100
    await dropStarERC1155.mint(deployer.address, tokenID, amount, calldata)
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
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'

    await dropStarERC1155.mint(deployer.address, tokenID, amount, calldata)

    const raribleV2Royalties = await dropStarERC1155.getRaribleV2Royalties(
      tokenID,
    )

    expect(raribleV2Royalties).to.be.an('array').of.lengthOf(0)
  })

  it('Should not fail calling royaltyInfo when royalties are empty', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const dropStarERC1155 = await DropStarERC1155.deploy()
    await dropStarERC1155.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'

    await dropStarERC1155.mint(deployer.address, tokenID, amount, calldata)

    const royaltyInfo = await dropStarERC1155.royaltyInfo(
      tokenID,
      parseUnits('100', 'ether'),
    )

    expect(royaltyInfo[0]).to.equal(ethers.constants.AddressZero)
    expect(royaltyInfo[1]).to.equal('0')
  })
})

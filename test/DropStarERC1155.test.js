const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('DropStarERC1155', function () {
  it('Should exist when deployed', async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const ageOfSmartMachine = await DropStarERC1155.deploy()
    await ageOfSmartMachine.deployed()

    await ageOfSmartMachine.uri(0)
  })

  it('Should be able to get/set uri per tokenID', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const ageOfSmartMachine = await DropStarERC1155.deploy()
    await ageOfSmartMachine.deployed()

    await ageOfSmartMachine.mint(deployer.address, 1, 1, '0x00')
    await ageOfSmartMachine.mint(deployer.address, 2, 1, '0x00')
  })

  it('Should return a 10% royalty with royaltyInfo', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const ageOfSmartMachine = await DropStarERC1155.deploy()
    await ageOfSmartMachine.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'
    const salePrice = 100
    const royaltyAmountExpected = '10'
    const royaltyPercentPoints = 10 * 100
    await ageOfSmartMachine.mint(deployer.address, tokenID, amount, calldata)
    await ageOfSmartMachine.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const result = await ageOfSmartMachine.royaltyInfo(tokenID, salePrice)

    expect(result.royaltyAmount.toString()).to.equal(royaltyAmountExpected)
  })

  it('Should return a 33% royalty with getRaribleV2Royalties', async function () {
    const [deployer] = await ethers.getSigners()

    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    const ageOfSmartMachine = await DropStarERC1155.deploy()
    await ageOfSmartMachine.deployed()
    const tokenID = 0
    const amount = 1
    const calldata = '0x00'

    const expectedRoyaltyPercentPoints = (33 * 100).toString()
    const royaltyPercentPoints = 33 * 100
    await ageOfSmartMachine.mint(deployer.address, tokenID, amount, calldata)
    await ageOfSmartMachine.setRoyalties(
      tokenID,
      deployer.address,
      royaltyPercentPoints,
    )
    const result = await ageOfSmartMachine.getRaribleV2Royalties(tokenID)

    expect(result).to.be.an('array').of.lengthOf(1)
    expect(result[0]).to.have.property('value')
    expect(result[0]).to.have.property('account')

    expect(result[0].account).to.equal(deployer.address)
    expect(result[0].value.toString()).to.equal(expectedRoyaltyPercentPoints)
  })
})

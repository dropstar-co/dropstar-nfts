const { fail } = require('assert')
const { expect } = require('chai')
const { ethers } = require('hardhat')

const { BN, soliditySha3, soliditySha3Raw } = require('web3-utils')

async function sign(
  _tokenAddress,
  _tokenId,
  _holderAddress,
  _price,
  _bidWinner,
) {
  // address _tokenAddress,
  // uint256 _tokenId,
  // address _holderAddress,
  // uint256 _price,
  // address _bidWinner,
  // bytes32 _signature
  const signatureRaw = await soliditySha3Raw(
    { type: 'address', value: _tokenAddress },
    { type: 'uint256', value: _tokenId },
    { type: 'address', value: _holderAddress },
    { type: 'uint256', value: _price },
    { type: 'address', value: _bidWinner },
  )

  const signature = await soliditySha3(
    { type: 'address', value: _tokenAddress },
    { type: 'uint256', value: _tokenId },
    { type: 'address', value: _holderAddress },
    { type: 'uint256', value: _price },
    { type: 'address', value: _bidWinner },
  )
  console.log({ signature, signatureRaw })
  return signature
}

describe('PrimarySaleOrchestrator', function () {
  let primarySaleOrchestrator
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _tokenAddress, _tokenId, _holderAddress, _price, _bidWinner, _signature

  beforeEach(async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy()

    const PrimarySaleOrchestrator = await ethers.getContractFactory(
      'PrimarySaleOrchestrator',
    )
    primarySaleOrchestrator = await PrimarySaleOrchestrator.deploy()

    this.mock = primarySaleOrchestrator
    ;[deployer, holder, bidWinner] = await ethers.getSigners()

    _tokenAddress = dropStarERC1155.address
    _tokenId = 0
    _holderAddress = holder.address
    _bidWinner = bidWinner.address
    _price = '60'

    _signature = await sign(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
    )
  })

  it('Should exist when deployed', async function () {
    await primarySaleOrchestrator.deployed()
  })

  it('Should fulfill a prepared bid', async function () {
    fail('TODO')
    /*
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
    */
  })

  it('Should fail when it has no allowance', async function () {
    console.log({
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _signature,
    })
    await primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _signature,
    )
  })
})

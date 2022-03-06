const { fail } = require('assert')
const { expect } = require('chai')
const { ethers, waffle } = require('hardhat')

const { BN, soliditySha3 } = require('web3-utils')

describe('PrimarySaleOrchestrator', function () {
  let primarySaleOrchestrator
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _amount = 1
  let _calldata = '0x00'

  let _tokenAddress,
    _tokenId,
    _holderAddress,
    _priceNotEnough,
    _price,
    _bidWinner,
    _startDate,
    _deadline,
    _signature

  beforeEach(async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy()

    const PrimarySaleOrchestrator = await ethers.getContractFactory(
      'PrimarySaleOrchestrator',
    )
    primarySaleOrchestrator = await PrimarySaleOrchestrator.deploy()

    await dropStarERC1155.deployed()
    await primarySaleOrchestrator.deployed()

    this.mock = primarySaleOrchestrator
    ;[deployer, holder, bidWinner] = await ethers.getSigners()

    _tokenAddress = dropStarERC1155.address
    _tokenId = 0
    _holderAddress = holder.address
    _bidWinner = bidWinner.address
    _price = 60
    _priceNotEnough = 59
    _startDate = 123000
    _deadline = 123456

    _signature = await sign(
      deployer,
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
    )

    await dropStarERC1155.mint(holder.address, _tokenId, _amount, _calldata)
  })

  async function sign(
    signer,
    _tokenAddress,
    _tokenId,
    _holderAddress,
    _price,
    _bidWinner,
    _startDate,
    _deadline,
  ) {
    let msgHash1 = await soliditySha3(
      {
        type: 'address',
        value: _tokenAddress,
      },
      { type: 'uint256', value: _tokenId },
    )

    console.log('doHash')
    console.log({
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
    })
    const msgHash2 = await primarySaleOrchestrator.doHash(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
    )

    console.log({ msgHash1, msgHash2 })

    // Sign the binary data
    let signature = await signer.signMessage(ethers.utils.arrayify(msgHash1))

    const ethersutilsverifyMessage = ethers.utils.verifyMessage(
      ethers.utils.arrayify(msgHash1),
      signature,
    )

    // For Solidity, we need the expanded-format of a signature
    let signatureSplit = ethers.utils.splitSignature(signature)
    const primarySaleOrchestratorrecover =
      await primarySaleOrchestrator.recover(
        msgHash1,
        signatureSplit.v,
        signatureSplit.r,
        signatureSplit.s,
      )

    console.log('end')

    const address1 = deployer.address
    const address2 = ethersutilsverifyMessage
    const address3 = primarySaleOrchestratorrecover

    console.log({
      address1,
      address2,
      address3,
    })

    return signatureSplit
  }

  it('Should exist when deployed', async function () {
    await primarySaleOrchestrator.deployed()
  })

  it('TODO', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
      _signature.r,
      _signature.s,
      _signature.v,

      { value: 9999 },
    )

    await result
  })

  it('Should revert when there is not enough native token payed to the SC', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
      _signature.r,
      _signature.s,
      _signature.v,

      { value: _priceNotEnough },
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when there is no native token payed to the SC', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    result = primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
      _signature.r,
      _signature.s,
      _signature.v,
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when the contract has no allowance for moving the NFT from the holder', async function () {
    const result = primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
      _signature.r,
      _signature.s,
      _signature.v,
    )

    expect(result).revertedWith('ERR1')
  })
})

const { fail } = require('assert')
const { expect } = require('chai')
const { ethers } = require('hardhat')
const { provider } = ethers

const { formatEther } = ethers.utils

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
    _price = ethers.utils.parseUnits('60', 'ether')
    _priceNotEnough = ethers.utils.parseUnits('59', 'ether')
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

    const msgHash2 = await primarySaleOrchestrator.doHash(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _startDate,
      _deadline,
    )

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

    return signatureSplit
  }

  it('Should exist when deployed', async function () {
    await primarySaleOrchestrator.deployed()
  })

  it('TODO', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const initialBalance = await provider.getBalance(holder.address)
    const initialBalance_BidWinner = await provider.getBalance(
      bidWinner.address,
    )

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
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

      { value: _price },
    )

    await result

    const finalBalance = await provider.getBalance(holder.address)
    const finalBalance_BidWinner = await provider.getBalance(bidWinner.address)

    console.log({
      initiBalance_BidWinner: formatEther(initialBalance_BidWinner),
      finalBalance_BidWinner: formatEther(finalBalance_BidWinner),
    })

    console.log({
      initiBalance: formatEther(initialBalance),
      finalBalance: formatEther(finalBalance),
    })
    console.log({
      _price: formatEther(_price),
      initiBalance: formatEther(initialBalance),
      finalBalance: formatEther(finalBalance),
      compuBalance: formatEther(initialBalance.add(_price)),
    })

    expect(formatEther(finalBalance)).to.equal(
      formatEther(initialBalance.add(_price)),
    )
  })

  it('Should revert if the caller is not the bid winner', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const initialBalance = await provider.getBalance(holder.address)

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

      { value: _price },
    )

    expect(result).revertedWith('ERR3')
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

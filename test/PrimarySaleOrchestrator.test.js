const { fail } = require('assert')
const { expect } = require('chai')
const { parseUnits } = require('ethers/lib/utils')
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

  let cheque, chequeTooOld, chequeTooYoung
  let _priceNotEnough

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
    ;[deployer, holder, bidWinner, paymentRecipient] = await ethers.getSigners()

    _priceNotEnough = parseUnits('59', 'ether')

    cheque = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      123000,
      123456,
    )

    chequeTooOld = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      ethers.utils.parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      123000,
      123456,
    )

    chequeTooYoung = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      ethers.utils.parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      123000,
      123456,
    )

    await dropStarERC1155.mint(
      holder.address,
      0 /*tokenId*/,
      1 /*amount*/,
      _calldata,
    )
  })

  async function sign(
    signer,
    _tokenAddress,
    _tokenId,
    _holderAddress,
    _price,
    _bidWinnerAddress,
    _paymentRecipientAddress,
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
      _bidWinnerAddress,
      _paymentRecipientAddress,
      _startDate,
      _deadline,
    )

    // Sign the binary data
    let signatureFull = await signer.signMessage(
      ethers.utils.arrayify(msgHash1),
    )

    const ethersutilsverifyMessage = ethers.utils.verifyMessage(
      ethers.utils.arrayify(msgHash1),
      signatureFull,
    )

    // For Solidity, we need the expanded-format of a signature
    let signature = ethers.utils.splitSignature(signatureFull)
    const primarySaleOrchestratorrecover =
      await primarySaleOrchestrator.recover(
        msgHash1,
        signature.v,
        signature.r,
        signature.s,
      )

    return {
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinnerAddress,
      _paymentRecipientAddress,
      _startDate,
      _deadline,
      _signature: signature,
    }
  }

  it('Should exist when deployed', async function () {
    await primarySaleOrchestrator.deployed()
  })

  it('TODO', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    console.log({ allowanceResult })

    const initialBalance = await provider.getBalance(paymentRecipient.address)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDateOld,
      cheque._deadlineOld,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,

      { value: cheque._price },
    )

    await result

    const finalBalance = await provider.getBalance(paymentRecipient.address)

    expect(formatEther(finalBalance)).to.equal(
      formatEther(initialBalance.add(_price)),
    )
  })

  it('Should fail when using too late a cheque for finishing the sale', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDateOld,
      cheque._deadlineOld,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,

      { value: cheque._price },
    )

    expect(result).revertedWith('ERRDATETOOOLD')
  })

  it('Should fail when using too early a cheque for finishing the sale', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDateAhead,
      cheque._deadlineAhead,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,

      { value: cheque._price },
    )

    expect(result).revertedWith('ERRDATETOOEARLY')
  })

  it('Should revert if the caller is not the bid winner', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,

      { value: cheque._price },
    )

    expect(result).revertedWith('ERR3')
  })

  it('Should revert when there is not enough native token payed to the SC', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,

      { value: _priceNotEnough },
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when there is no native token payed to the SC', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when the contract has no allowance for moving the NFT from the holder', async function () {
    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinner,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      cheque._signature.r,
      cheque._signature.s,
      cheque._signature.v,
    )

    expect(result).revertedWith('ERR1')
  })
})

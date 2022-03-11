const { fail } = require('assert')
const { expect } = require('chai')
const { parseUnits, parseEther } = require('ethers/lib/utils')
const { ethers, network } = require('hardhat')
const { provider } = ethers

const { formatEther } = ethers.utils

const { BN, soliditySha3 } = require('web3-utils')

describe('PrimarySaleOrchestrator', function () {
  let primarySaleOrchestrator
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _amount = 1
  let _calldata = '0x00'

  const ONE_DAY = 60 * 60 * 24
  const ONE_HOUR = 60 * 60

  let cheque, chequeTooOld, chequeTooYoung, chequeHolder
  let _priceNotEnough

  let currentBlockTimestamp

  async function oneDayAhead() {
    //https://ethereum.stackexchange.com/questions/86633/time-dependent-tests-with-hardhat
    await network.provider.send('evm_setNextBlockTimestamp', [
      currentBlockTimestamp + ONE_DAY,
    ])
    await network.provider.send('evm_mine') // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
  }

  beforeEach(async function () {
    currentBlockTimestamp = parseInt(
      (await provider.getBlock(await provider.getBlockNumber())).timestamp,
    )

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
      currentBlockTimestamp - ONE_HOUR,
      currentBlockTimestamp + ONE_HOUR,
    )

    chequeTooOld = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      ethers.utils.parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      currentBlockTimestamp - ONE_DAY - ONE_HOUR,
      currentBlockTimestamp - ONE_DAY + ONE_HOUR,
    )

    chequeTooYoung = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      ethers.utils.parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      currentBlockTimestamp + ONE_DAY - ONE_HOUR,
      currentBlockTimestamp + ONE_DAY + ONE_HOUR,
    )

    chequeHolder = await sign(
      holder,
      dropStarERC1155.address,
      0,
      holder.address,
      parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      currentBlockTimestamp - ONE_HOUR,
      currentBlockTimestamp + ONE_HOUR,
    )

    await primarySaleOrchestrator.setSigners([deployer.address])

    const hash = await primarySaleOrchestrator.doHash(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
    )
    const recoverExpected = deployer.address
    const recoverReceived = await primarySaleOrchestrator.recover(
      hash,
      cheque._signature.v,
      cheque._signature.r,
      cheque._signature.s,
    )

    //console.log({ hash, recoverExpected, recoverReceived })

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
    /*
    let msgHash2 = await soliditySha3(
      {
        type: 'address',
        value: _tokenAddress,
      },
      { type: 'uint256', value: _tokenId },
    )
    */

    const msgHash1 = await primarySaleOrchestrator.doHash(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinnerAddress,
      _paymentRecipientAddress,
      _startDate,
      _deadline,
    )

    //console.log({ msgHash1 })

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
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const initialBalance = await provider.getBalance(paymentRecipient.address)

    const hash = await primarySaleOrchestrator.doHash(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
    )
    const recoverExpected = deployer.address
    const recoverReceived = await primarySaleOrchestrator.recover(
      hash,
      cheque._signature.v,
      cheque._signature.r,
      cheque._signature.s,
    )

    const recoverSigners = await primarySaleOrchestrator.signersAll()

    const result = await primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      [
        {
          r: cheque._signature.r,
          s: cheque._signature.s,
          v: cheque._signature.v,
        },
      ],
      { value: cheque._price },
    )

    const finalBalance = await provider.getBalance(paymentRecipient.address)

    expect(formatEther(finalBalance)).to.equal(
      formatEther(initialBalance.add(cheque._price)),
    )
  })

  it('Should revert when signer is not a valid one', async function () {
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      chequeHolder._tokenAddress,
      chequeHolder._tokenId,
      chequeHolder._holderAddress,
      chequeHolder._price,
      chequeHolder._bidWinnerAddress,
      chequeHolder._paymentRecipientAddress,
      chequeHolder._startDate,
      chequeHolder._deadline,
      [
        {
          r: chequeHolder._signature.r,
          s: chequeHolder._signature.s,
          v: chequeHolder._signature.v,
        },
      ],
      { value: chequeHolder._price },
    )

    expect(result).revertedWith('ERR05')
  })

  it('Should fail when setSigners is called by other than owner', async function () {
    const result = primarySaleOrchestrator
      .connect(holder)
      .setSigners([holder.address])
    expect(result).revertedWith('Ownable: caller is not the owner')
  })

  it('Should fail when using too late a cheque for finishing the sale', async function () {
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      chequeTooOld._tokenAddress,
      chequeTooOld._tokenId,
      chequeTooOld._holderAddress,
      chequeTooOld._price,
      chequeTooOld._bidWinnerAddress,
      chequeTooOld._paymentRecipientAddress,
      chequeTooOld._startDate,
      chequeTooOld._deadline,
      [
        {
          r: chequeTooOld._signature.r,
          s: chequeTooOld._signature.s,
          v: chequeTooOld._signature.v,
        },
      ],

      { value: chequeTooOld._price },
    )

    expect(result).revertedWith('ERRDATETOOOLD')
  })

  it('Should fail when using too early a cheque for finishing the sale', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.connect(bidWinner).fulfillBid(
      chequeTooYoung._tokenAddress,
      chequeTooYoung._tokenId,
      chequeTooYoung._holderAddress,
      chequeTooYoung._price,
      chequeTooYoung._bidWinnerAddress,
      chequeTooYoung._paymentRecipientAddress,
      chequeTooYoung._startDate,
      chequeTooYoung._deadline,
      [
        {
          r: chequeTooYoung._signature.r,
          s: chequeTooYoung._signature.s,
          v: chequeTooYoung._signature.v,
        },
      ],

      { value: chequeTooYoung._price },
    )

    expect(result).revertedWith('ERRDATETOOEARLY')
  })

  it('Should revert if the caller is not the bid winner', async function () {
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      [
        {
          r: cheque._signature.r,
          s: cheque._signature.s,
          v: cheque._signature.v,
        },
      ],

      { value: cheque._price },
    )

    expect(result).revertedWith('ERR3')
  })

  it('Should revert when there is not enough native token payed to the SC', async function () {
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      [
        {
          r: cheque._signature.r,
          s: cheque._signature.s,
          v: cheque._signature.v,
        },
      ],

      { value: _priceNotEnough },
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when there is no native token payed to the SC', async function () {
    await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(primarySaleOrchestrator.address, true)

    result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      [
        {
          r: cheque._signature.r,
          s: cheque._signature.s,
          v: cheque._signature.v,
        },
      ],
    )

    expect(result).revertedWith('ERR2')
  })

  it('Should revert when the contract has no allowance for moving the NFT from the holder', async function () {
    const result = primarySaleOrchestrator.fulfillBid(
      cheque._tokenAddress,
      cheque._tokenId,
      cheque._holderAddress,
      cheque._price,
      cheque._bidWinnerAddress,
      cheque._paymentRecipientAddress,
      cheque._startDate,
      cheque._deadline,
      [
        {
          r: cheque._signature.r,
          s: cheque._signature.s,
          v: cheque._signature.v,
        },
      ],
    )

    expect(result).revertedWith('ERR1')
  })

  it('Should revert when receiving ether with data', async function () {
    const tx = {
      to: primarySaleOrchestrator.address,
      value: parseEther('1'),
      data: '0x01',
    }

    const sendTransaction = deployer.sendTransaction(tx)

    expect(sendTransaction).revertedWith('ERR00')
  })

  it('Should revert when receiving ether with no data', async function () {
    const tx = {
      to: primarySaleOrchestrator.address,
      value: parseEther('1'),
    }
    const sendTransaction = deployer.sendTransaction(tx)

    expect(sendTransaction).revertedWith('ERR01')
  })
})

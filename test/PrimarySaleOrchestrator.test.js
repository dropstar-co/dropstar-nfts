const { fail } = require('assert')
const { expect } = require('chai')
const { parseUnits, parseEther } = require('ethers/lib/utils')
const { ethers, network } = require('hardhat')
const { provider } = ethers

const { formatEther } = ethers.utils

const { BN, soliditySha3 } = require('web3-utils')

const MOCK_URI = 'mockURI'

describe('PrimarySaleOrchestrator', function () {
  let pso
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _amount = 1
  let _calldata = '0x00'

  const ONE_DAY = 60 * 60 * 24
  const ONE_HOUR = 60 * 60

  let cheque, chequeTooOld, chequeTooYoung, chequeHolder, chequeInvalidDates
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
    dropStarERC1155 = await DropStarERC1155.deploy(MOCK_URI)

    const PrimarySaleOrchestrator = await ethers.getContractFactory(
      'PrimarySaleOrchestrator',
    )
    pso = await PrimarySaleOrchestrator.deploy()

    await dropStarERC1155.deployed()
    await pso.deployed()

    this.mock = pso
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

    chequeInvalidDates = await sign(
      deployer,
      dropStarERC1155.address,
      0,
      holder.address,
      parseUnits('60', 'ether'),
      bidWinner.address,
      paymentRecipient.address,
      //These are backwar
      currentBlockTimestamp + ONE_HOUR,
      currentBlockTimestamp - ONE_HOUR,
    )

    await pso.setSigners([deployer.address])

    const hash = await pso.doHash(
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
    const recoverReceived = await pso.recover(
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

    const msgHash1 = await pso.doHash(
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
    const primarySaleOrchestratorrecover = await pso.recover(
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
    await pso.deployed()
  })

  it('TODO', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const initialBalance = await provider.getBalance(paymentRecipient.address)

    const hash = await pso.doHash(
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
    const recoverReceived = await pso.recover(
      hash,
      cheque._signature.v,
      cheque._signature.r,
      cheque._signature.s,
    )

    const recoverSigners = await pso.signersAll()

    const result = await call_PSO_fulfillBid(pso, bidWinner, cheque)

    const finalBalance = await provider.getBalance(paymentRecipient.address)

    expect(formatEther(finalBalance)).to.equal(
      formatEther(initialBalance.add(cheque._price)),
    )
  })

  it('Should revert when dates are backwards', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, bidWinner, chequeInvalidDates)

    await expect(result).to.be.revertedWith('ERRDATEINVALID')
  })

  it('Should revert when signer is not a valid one', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, bidWinner, chequeHolder)

    await expect(result).to.be.revertedWith('ERR05')
  })

  it('Should fail when setSigners is called by other than owner', async function () {
    const result = pso.connect(holder).setSigners([holder.address])
    await expect(result).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should fail when using too late a cheque for finishing the sale', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, bidWinner, chequeTooOld)

    await expect(result).to.be.revertedWith('ERRDATELATE')
  })

  it('Should fail when using too early a cheque for finishing the sale', async function () {
    const allowanceResult = await dropStarERC1155
      .connect(holder)
      .setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, bidWinner, chequeTooYoung)

    await expect(result).to.be.revertedWith('ERRDATESOON')
  })

  it('Should revert if the caller is not the bid winner', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, deployer, cheque)

    await expect(result).to.be.revertedWith('ERR3')
  })

  it('Should revert when there is not enough native token payed to the SC', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    const result = call_PSO_fulfillBid(pso, deployer, cheque, {
      value: _priceNotEnough,
    })

    await expect(result).to.be.revertedWith('ERR2')
  })

  it('Should revert when there is no native token payed to the SC', async function () {
    await dropStarERC1155.connect(holder).setApprovalForAll(pso.address, true)

    result = pso.fulfillBid(
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

    await expect(result).to.be.revertedWith('ERR2')
  })

  it('Should revert when the contract has no allowance for moving the NFT from the holder', async function () {
    const result = pso.fulfillBid(
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

    await expect(result).to.be.revertedWith('ERR1')
  })

  it('Should revert when receiving ether with data', async function () {
    const tx = {
      to: pso.address,
      value: parseEther('1'),
      data: '0x01',
    }

    const sendTransaction = deployer.sendTransaction(tx)

    await expect(sendTransaction).revertedWith('ERR01')
  })

  it('Should revert when receiving ether with no data', async function () {
    const tx = {
      to: pso.address,
      value: parseEther('1'),
    }
    const sendTransaction = deployer.sendTransaction(tx)

    await expect(sendTransaction).revertedWith('ERR01')
  })
})
async function call_PSO_fulfillBid(
  primarySaleOrchestrator,
  caller,
  cheque,
  overrides,
) {
  return primarySaleOrchestrator.connect(caller).fulfillBid(
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
    overrides
      ? overrides
      : {
          value: cheque._price,
        },
  )
}

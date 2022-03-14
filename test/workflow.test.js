const { expect } = require('chai')
const { parseUnits, parseEther } = require('ethers/lib/utils')
const { ethers } = require('hardhat')
const { provider } = ethers

const { formatEther } = ethers.utils

const DATA = '0x00'
const MOCK_URI = 'mockURI'

describe('PrimarySaleOrchestrator', function () {
  let pso
  let nft
  let deployer,
    dropstar,
    artist,
    paymentRecipient,
    bidWinner1,
    bidWinner2,
    bidWinner3

  let tokenId = 0
  let _amount = 1
  let _calldata = '0x00'

  const ONE_DAY = 60 * 60 * 24
  const ONE_HOUR = 60 * 60

  let chequeBidWinner1, chequeBidWinner2, chequeBidWinner3

  let currentBlockTimestamp

  let PRICE_BIDWINNER_1, PRICE_BIDWINNER_2, PRICE_BIDWINNER_3

  async function createCheques() {
    currentBlockTimestamp = parseInt(
      (await provider.getBlock(await provider.getBlockNumber())).timestamp,
    )
    ;[
      deployer,
      dropstar,
      artist,
      paymentRecipient,
      bidWinner1,
      bidWinner2,
      bidWinner3,
    ] = await ethers.getSigners()

    tokenId = 0
    PRICE_BIDWINNER_1 = parseUnits('259', 'ether')
    PRICE_BIDWINNER_2 = parseUnits('259', 'ether')
    PRICE_BIDWINNER_3 = parseUnits('259', 'ether')

    chequeBidWinner1 = await sign(
      deployer,
      nft.address,
      tokenId,
      artist.address,
      PRICE_BIDWINNER_1,
      bidWinner1.address,
      paymentRecipient.address,
      currentBlockTimestamp,
      currentBlockTimestamp + ONE_DAY,
    )

    chequeBidWinner2 = await sign(
      deployer,
      nft.address,
      tokenId,
      artist.address,
      PRICE_BIDWINNER_2,
      bidWinner2.address,
      paymentRecipient.address,
      currentBlockTimestamp,
      currentBlockTimestamp + ONE_DAY,
    )

    chequeBidWinner3 = await sign(
      deployer,
      nft.address,
      tokenId,
      artist.address,
      PRICE_BIDWINNER_3,
      bidWinner3.address,
      paymentRecipient.address,
      currentBlockTimestamp,
      currentBlockTimestamp + ONE_DAY,
    )
  }

  /**
   * This is not an actual unit test, but a way to document the procedure we are
   * going to go through with the drops regarding the blockchain.
   */
  it('performs the whole procedure properly', async function () {
    // Part A.- Prepare the minting.
    const NFT = await ethers.getContractFactory('DropStarERC1155')
    nft = await NFT.deploy(MOCK_URI)
    await nft.deployed()

    //
    //
    //
    //
    //
    //
    //

    /**
     * ######################################################################
     * ######################################################################
     * ######################################################################
     * ######################################################################
     * ######################################################################
     * ######################################################################
     */

    //TODO: disabled test
    return

    // Part B.- Prepare the PSO
    const PSO = await ethers.getContractFactory('PrimarySaleOrchestrator')
    pso = await PSO.deploy()

    await pso.deployed()

    await createCheques()

    const initialBalance = await provider.getBalance(paymentRecipient.address)

    const hash = await pso.doHash(
      chequeBidWinner1._tokenAddress,
      chequeBidWinner1._tokenId,
      chequeBidWinner1._holderAddress,
      chequeBidWinner1._price,
      chequeBidWinner1._bidWinnerAddress,
      chequeBidWinner1._paymentRecipientAddress,
      chequeBidWinner1._startDate,
      chequeBidWinner1._deadline,
    )
    const recoverExpected = deployer.address
    const recoverReceived = await pso.recover(
      hash,
      chequeBidWinner1._signature.v,
      chequeBidWinner1._signature.r,
      chequeBidWinner1._signature.s,
    )

    const recoverSigners = await pso.signersAll()

    await nft.connect(artist).setApprovalForAll(pso.address, true)

    const result = await call_PSO_fulfillBid(pso, bidWinner1, chequeBidWinner1)

    const finalBalance = await provider.getBalance(paymentRecipient.address)

    expect(formatEther(finalBalance)).to.equal(
      formatEther(initialBalance.add(chequeBidWinner1._price)),
    )
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
  let signatureFull = await signer.signMessage(ethers.utils.arrayify(msgHash1))

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

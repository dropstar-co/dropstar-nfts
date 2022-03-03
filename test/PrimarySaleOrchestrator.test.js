const { fail } = require('assert')
const { expect } = require('chai')
//const { ethers } = require('hardhat')

const { BN, soliditySha3 } = require('web3-utils')

describe('PrimarySaleOrchestrator', function () {
  let primarySaleOrchestrator
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _tokenAddress,
    _tokenId,
    _holderAddress,
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
  /*
  it('Should fulfill a prepared bid', async function () {
    fail('TODO')
    
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

  /*
  it('Should fail when it has no allowance', async function () {
    await primarySaleOrchestrator.fulfillBid(
      _tokenAddress,
      _tokenId,
      _holderAddress,
      _price,
      _bidWinner,
      _signature,
    )
  })
    */
})

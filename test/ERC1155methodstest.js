const { fail } = require('assert')
const { expect } = require('chai')
const { parseUnits, parseEther } = require('ethers/lib/utils')
const { ethers, network } = require('hardhat')
const { provider } = ethers

const { formatEther } = ethers.utils

const { BN, soliditySha3 } = require('web3-utils')

const MOCK_URI = 'mockURI'

describe('PrimarySaleOrchestrator', function () {
  let dropStarERC1155
  let deployer, holder, bidWinner

  let _amount = 1
  let _calldata = '0x00'

  beforeEach(async function () {
    const DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy(MOCK_URI)

    await dropStarERC1155.deployed()

    this.mock = dropStarERC1155
    ;[deployer, holder, bidWinner, paymentRecipient] = await ethers.getSigners()
  })

  it('erc1155 methods testing', async function () {
    await dropStarERC1155.mint(
      deployer.address,
      0 /*tokenId*/,
      1 /*amount*/,
      _calldata,
    )

    await dropStarERC1155.safeTransferFrom(
      deployer.address,
      holder.address,
      0,
      1,
      _calldata,
    )
  })
})

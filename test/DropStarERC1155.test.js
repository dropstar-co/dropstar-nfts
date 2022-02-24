const { expect } = require('chai')
const aaaaa = require('hardhat')

Object.keys(aaaaa)

const { ethers } = aaaaa

const keccak256 = ethers.utils.hashMessage

const DATA = '0x00'

const { shouldSupportInterfaces } = require('./SupportsInterface.behavior')

describe('DropStarERC1155 general capabilities', function () {
  let DropStarERC1155, dropStarERC1155
  let deployer, admin, artist, other
  let MINTER_ROLE
  let tokenID, tokenAmount
  let tokenIDs, tokenAmounts

  const otherMissingURISetterRoleRevert =
    'AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'

  beforeEach(async function () {
    DropStarERC1155 = await ethers.getContractFactory('DropStarERC1155')
    dropStarERC1155 = await DropStarERC1155.deploy()

    this.mock = dropStarERC1155
    ;[deployer, admin, artist, other] = await ethers.getSigners()

    MINTER_ROLE = await dropStarERC1155.MINTER_ROLE()

    tokenIDs = [0, 1, 2]
    tokenAmounts = [1, 10, 20]

    tokenID = 0
    tokenAmount = 1
  })

  shouldSupportInterfaces([
    'ERC721',
    'ERC721Enumerable',
    'AccessControl',
    'AccessControlEnumerable',
  ])

  it('Should exist when deployed', async function () {
    console.log(Object.keys(aaaaa))

    await dropStarERC1155.deployed()

    await dropStarERC1155.uri(0)
  })

  it('Should allow the artist to mint nfts', async function () {
    // Execution
    const grantRole = dropStarERC1155.grantRole(MINTER_ROLE, artist.address)

    //Validation
    await expect(grantRole)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(MINTER_ROLE, artist.address, deployer.address)

    await dropStarERC1155
      .connect(artist)
      .mint(artist.address, tokenID, tokenAmount, DATA)

    expect(await dropStarERC1155.balanceOf(artist.address, tokenID)).to.equal(
      tokenAmount,
    )
  })

  it('Should allow the artist to mintBatch the nfts', async function () {
    // Execution
    const grantRole = dropStarERC1155.grantRole(MINTER_ROLE, artist.address)
    await dropStarERC1155
      .connect(artist)
      .mintBatch(artist.address, tokenIDs, tokenAmounts, DATA)

    //Validation
    await expect(grantRole)
      .to.emit(dropStarERC1155, 'RoleGranted')
      .withArgs(MINTER_ROLE, artist.address, deployer.address)

    for (let index = 0; index < tokenIDs.length; index++) {
      expect(
        await dropStarERC1155.balanceOf(artist.address, tokenIDs[index]),
      ).to.equal(tokenAmounts[index])
    }
  })

  it('Should deny non minter to mint nfts', async function () {
    // Execution
    const mintTx = dropStarERC1155
      .connect(other)
      .mint(other.address, tokenID, tokenAmount, DATA)

    //Validation
    await expect(mintTx).revertedWith(otherMissingURISetterRoleRevert)
  })

  it('Should deny non minter to batchMint nfts', async function () {
    //Execution
    const mintTx = dropStarERC1155
      .connect(other)
      .mintBatch(other.address, tokenIDs, tokenAmounts, DATA)

    //Validation
    await expect(mintTx).revertedWith(otherMissingURISetterRoleRevert)
  })

  it('Should support all interfaces', async function () {
    const erc2981 = keccak256('getRaribleV2Royalties(uint256)') // == 0xcad96cca

    console.log(erc2981)
    console.log(0xcad96cca)
    console.log('0xcad96cca')

    //Execution
    const mintTx = dropStarERC1155
      .connect(other)
      .mintBatch(other.address, tokenIDs, tokenAmounts, DATA)

    //Validation
    await expect(mintTx).revertedWith(otherMissingURISetterRoleRevert)
  })
})

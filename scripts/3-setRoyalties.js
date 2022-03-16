const hre = require('hardhat')

const { ROYALTY_SPLITS_ADDRESS } = require('../.env.js')

const { parseUnits } = ethers.utils

async function main() {
  const [deployer] = await ethers.getSigners()

  const contractAddress = '0xea308c14D36c833CAb297809dCc13fDc0518579C'
  const nft = await hre.ethers.getContractAt('DropStarERC1155', contractAddress)

  const royaltyPercentPoints = 2.5 * 100

  const royaltyInfo_0 = await nft.royaltyInfo(0, parseUnits('100', 'ether'))

  console.log({ royaltyInfo_0 })
  console.log({ royaltyPercentPoints })

  console.log('Setting royalties')
  const tokenIds = [0, 1, 2, 3, 4, 5]
  let i
  for (i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]
    await nft
      .connect(deployer)
      .setRoyalties(tokenId, ROYALTY_SPLITS_ADDRESS, royaltyPercentPoints)

    console.log(`    on tokenId=${i}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

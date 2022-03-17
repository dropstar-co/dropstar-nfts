const hre = require('hardhat')

const {
  ROYALTY_SPLITS_ADDRESS,
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
} = require('../.env.js')

const { parseUnits, formatEther } = ethers.utils

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  )

  const royaltyPercentPoints = 2.5 * 100

  const royaltyInfo_0 = await nft.royaltyInfo(0, parseUnits('100', 'ether'))

  console.log(royaltyInfo_0.royaltyAmount)
  console.log({ royaltyPercentPoints })

  const royaltyCharged = formatEther(royaltyInfo_0.royaltyAmount.toString())

  console.log({ royaltyCharged })

  return

  console.log('Setting royalties')
  const tokenIds = [0, 1, 2, 3, 4, 5, 6]
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

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

  const tokenIds = [0, 1, 2, 3, 4, 5, 6]
  const royaltyPercentPoints = 3 * 100
  console.log({ royaltyPercentPoints })

  for (i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]
    const royaltyInfo = await nft.royaltyInfo(0, parseUnits('100', 'ether'))
    console.log({ royaltyInfo })
    const royaltyCharged = parseFloat(
      formatEther(royaltyInfo.royaltyAmount.toString()),
    )
    console.log({ royaltyCharged })

    if (
      royaltyInfo.receiver !== ROYALTY_SPLITS_ADDRESS ||
      royaltyCharged !== 3
    ) {
      console.log('Need to update tokenId=' + i)
      await nft
        .connect(deployer)
        .setRoyalties(tokenId, ROYALTY_SPLITS_ADDRESS, royaltyPercentPoints)

      console.log(`    on tokenId=${i}`)
    } else {
      console.log('tokenId=' + i + ' OK')
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

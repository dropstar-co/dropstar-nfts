const hre = require('hardhat')

const {
  ROYALTY_SPLITS_ADDRESS,
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
} = require('../.env.js')

const { parseUnits, formatEther } = ethers.utils

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
  )

  const tokenIds = [0, 1, 2, 3, 4, 5, 6]
  const percent = 3
  const royaltyPercentPoints = percent * 100
  console.log({ royaltyPercentPoints })

  console.log({
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
    ROYALTY_SPLITS_ADDRESS,
  })

  for (i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]
    const royaltyInfo = await nft.royaltyInfo(
      tokenId,
      parseUnits('100', 'ether'),
    )

    const royaltyCharged = parseFloat(
      formatEther(royaltyInfo.royaltyAmount.toString()),
    )
    console.log({ royaltyInfo, royaltyCharged })

    if (
      royaltyInfo.receiver !== ROYALTY_SPLITS_ADDRESS ||
      royaltyCharged !== percent
    ) {
      console.log('Need to update tokenId=' + i)

      await nft.setRoyalties(
        tokenId,
        ROYALTY_SPLITS_ADDRESS,
        royaltyPercentPoints,
      )

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

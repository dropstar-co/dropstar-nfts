const hre = require('hardhat')

const {
  GUTTO_SERTA_METAMASK_ADDRESS,
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
} = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
  )

  const tokenIds = [0, 1, 2, 3, 4, 5]
  const amounts = [1, 1, 1, 1, 1, 1]
  let i
  for (i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]

    const supply = await nft.totalSupply(tokenId)
    console.log(
      `Suply of ${NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED}/${tokenId} = ${supply}`,
    )
  }

  console.log(
    `Sending to GUTTO_SERTA_METAMASK_ADDRESS=${GUTTO_SERTA_METAMASK_ADDRESS}`,
  )
  await nft.mintBatch(GUTTO_SERTA_METAMASK_ADDRESS, tokenIds, amounts, '0x00')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

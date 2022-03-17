const hre = require('hardhat')

const {
  GUTTO_SERTA_METAMASK_ADDRESS,
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
} = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  )

  const isGuttoMinter = await nft.hasRole(
    await nft.MINTER_ROLE(),
    GUTTO_SERTA_METAMASK_ADDRESS,
  )

  console.log('Is Gutto minter? ' + isGuttoMinter)

  if (!isGuttoMinter) {
    console.log('Granting minter role to gutto')
    await nft.grantRole(await nft.MINTER_ROLE(), GUTTO_SERTA_METAMASK_ADDRESS)

    console.log('    granted')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

const hre = require('hardhat')

const {
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  DROPSTAR_ADDRESS,
  GUTTO_SERTA_METAMASK_ADDRESS,
} = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  )

  const hasRole = await nft.hasRole(await nft.MINTER_ROLE(), deployer.address)

  console.log(`hasRole = ${hasRole}`)
  if (!hasRole) {
    throw `deployer.address=${deployer.address} does not have the role MINTER_ROLE`
  }

  const numberOfTickets = (await nft.totalSupply(6)).toNumber()
  console.log({ numberOfTickets })

  if (numberOfTickets < 50) {
    console.log('Minting for gutto')

    await nft.mintBatch(GUTTO_SERTA_METAMASK_ADDRESS, [6], [10], '0x00')
    console.log('    minted')

    console.log('Minting for dropstar')
    await nft.mintBatch(DROPSTAR_ADDRESS, [6], [40], '0x00')
    console.log('    minted')
  } else {
    console.log('There are already 50 tickets')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

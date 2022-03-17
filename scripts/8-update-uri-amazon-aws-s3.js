// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const { NFT_PLASTIK_BODIES_CONTRACT_ADDRESS } = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log(`deployer.addresss = ${deployer.address}`)

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  )

  console.log('nft.address = ' + nft.address)

  const blockchainURI = await nft.uri(0)
  const metadataURI =
    'https://dropstar-nft.s3.eu-west-3.amazonaws.com/Drop+1_AOSM_x/{id}.json'

  console.log({ metadataURI, blockchainURI })

  if (blockchainURI == metadataURI) {
    console.log('URI already updated to the newest')
  } else {
    console.log('Setting metadataURI')
    await nft.setURI(metadataURI)
    console.log('      set')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

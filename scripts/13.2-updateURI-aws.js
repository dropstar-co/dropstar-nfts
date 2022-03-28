// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const {
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
} = require('../.env.js')

async function main() {
  const newMetadataURI =
    'https://dropstar-nft.s3.eu-west-3.amazonaws.com/Drop+1_AOSM_x/{id}.json'

  const [deployer] = await ethers.getSigners()

  console.log(`deployer.addresss = ${deployer.address}`)

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
  )

  console.log('nft.address = ' + nft.address)

  const oldMetadataURI = await nft.uri(0)

  console.log({ newMetadataURI, oldMetadataURI })

  if (oldMetadataURI == newMetadataURI) {
    console.log('URI already updated to the newest')
  } else {
    console.log('Setting metadataURI')
    await nft.setURI(newMetadataURI)
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

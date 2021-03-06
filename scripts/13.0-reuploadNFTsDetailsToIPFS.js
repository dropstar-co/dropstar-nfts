// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const { NFTStorage, File } = require('nft.storage')
const fetch = require('node-fetch')

const {
  NFT_STORAGE_API_KEY,
  GUTTO_SERTA_ADDRESS,
  ROYALTY_SPLITS_ADDRESS,
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
} = require('../.env.js')

const useNTFStorage_directory = require('./nftstorage')

async function main() {
  const storage = new NFTStorage({ token: NFT_STORAGE_API_KEY })

  const metadataCID = await useNTFStorage_directory(
    storage,
    './nft/Drop 1_AOSMx-converted/img',
    './nft/Drop 1_AOSMx-converted/metadata',
  )

  const metadataURI = `ipfs://${metadataCID.cid}/{id}`

  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}0`)
  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}1`)
  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}2`)
  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}3`)
  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}4`)
  console.log(`ipfs://${metadataCID.cid}/${'0'.repeat(63)}5`)

  console.log({ metadataCID })
  console.log({ metadataURI })

  const [deployer] = await ethers.getSigners()

  console.log(`deployer.addresss = ${deployer.address}`)

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS_ROYALTIES_FIXED,
  )

  console.log(await nft.uri(0))

  return

  console.log('Setting the uri')
  await nft.setUri(metadataURI)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

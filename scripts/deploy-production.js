// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const { NFTStorage, File } = require('nft.storage')
const fetch = require('node-fetch')

const { NFT_STORAGE_API_KEY } = require('../.env.js')

const useNTFStorage_directory = require('./nftstorage')

async function main() {
  const storage = new NFTStorage({ token: NFT_STORAGE_API_KEY })

  const metadataCID = await useNTFStorage_directory(
    storage,
    '/home/jorge/development/dropstar/1-nft-deploy/nft/Drop 1_AOSMx/img',
    '/home/jorge/development/dropstar/1-nft-deploy/nft/Drop 1_AOSMx/metadata',
  )

  const metadataURI = `ipfs://${metadataCID.cid}/{id}`

  console.log({ metadataCID })
  console.log({ metadataURI })

  const [deployer] = await ethers.getSigners()

  console.log(`deployer.addresss = ${deployer.address}`)

  const DropStarERC1155 = await hre.ethers.getContractFactory('DropStarERC1155')
  const dropStarERC1155 = await DropStarERC1155.deploy(metadataURI)

  await dropStarERC1155.deployed()

  console.log('dropStarERC1155 deployed to:', dropStarERC1155.address)

  const calldata = '0x00'

  console.log('Sending to dropstarDeveloper')

  await dropStarERC1155.mintBatch(
    deployer.address,
    [0, 1, 2, 3, 4, 5],
    [1, 1, 1, 1, 1, 1],
    calldata,
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

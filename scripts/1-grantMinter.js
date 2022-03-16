const hre = require('hardhat')

const { parseUnits } = ethers.utils

const { GUTTO_SERTA_ADDRESS } = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const dropstarDeveloper = '0x5e14b4d9af29066153c9ee3fc2563c95784a687a'
  const contractAddress = '0x5bd79179cf7742d1263e6f3a7a06a47296f7b305'
  const nft = await hre.ethers.getContractAt('DropStarERC1155', contractAddress)

  await nft.grantRole(await nft.MINTER_ROLE(), GUTTO_SERTA_ADDRESS)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

const hre = require('hardhat')

const { GUTTO_SERTA_ADDRESS } = require('../.env.js')

const { parseUnits } = ethers.utils

async function main() {
  const [deployer] = await ethers.getSigners()

  const contractAddress = '0xea308c14D36c833CAb297809dCc13fDc0518579C'
  const nft = await hre.ethers.getContractAt('DropStarERC1155', contractAddress)

  const tokenIds = [0, 1, 2, 3, 4, 5]
  const amounts = [1, 1, 1, 1, 1, 1]

  console.log('Sending to GUTTO_SERTA_ADDRESS')
  await nft.mintBatch(GUTTO_SERTA_ADDRESS, tokenIds, amounts, '0x00')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

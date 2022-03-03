const hre = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()

  const tokenAddress = '0xC064010b518666586ab533060ccdB79b105f92BE'
  const from = deployer.address

  const erc1155 = await hre.ethers.getContractAt(
    'DropStarERC1155',
    tokenAddress,
  )

  console.log('Setting uri')
  const uri =
    'ipfs://bafybeieu7gdohtsnioqtuvllhuu37mvovlro3eo4gzddyl3te3ty4jd474/{id}'
  await erc1155.setURI(uri)
  console.log('URI set to ' + uri)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

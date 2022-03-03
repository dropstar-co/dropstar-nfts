const hre = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()

  const contractAddresses = ['0xC064010b518666586ab533060ccdB79b105f92BE']

  const tokenID = 0
  const dropstarDeveloper = '0x5e14b4d9af29066153c9ee3fc2563c95784a687a'

  const dummyNFT = await hre.ethers.getContractAt(
    'ERC1155',
    '0x2953399124f0cbb46d2cbacd8a89cf0599974963',
  )
  const uri_dummy = await dummyNFT.uri(0)
  const balance_dummy = await dummyNFT.balanceOf(
    dropstarDeveloper,
    '42553992891219984983126389820265221838647002681979716060980732704314978467850',
  )

  console.log({ dummyNFT, uri_dummy, balance_dummy })
  console.log({ contractAddresses })

  for (var i = 0; i < contractAddresses.length; i++) {
    const contractAddress = contractAddresses[i]
    const dropStarERC1155 = await hre.ethers.getContractAt(
      'DropStarERC1155',
      contractAddress,
    )
    const uri = await dropStarERC1155.uri(0)
    const balance = await dropStarERC1155.balanceOf(dropstarDeveloper, tokenID)
    console.log({ contractAddress, uri, balance })
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

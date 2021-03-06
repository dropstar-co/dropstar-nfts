const hre = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()

  const contractAddresses = ['0x4d07d7308ebf6f5209850f40becbe608d362b1f5']

  const tokenID =
    '103184150694614445490038962927795508385754129395909934469658111649233795809281'
  const dropstarDeveloper = '0x5e14b4d9af29066153c9ee3fc2563c95784a687a'

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

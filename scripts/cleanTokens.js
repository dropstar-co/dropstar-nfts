const hre = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()

  const garbageCollectorAddress = '0x51cccD473A0B4395De0704BC118F43aE71f2d075'

  const tokens = [
    {
      contractAddress: '0x9612eaa118f1a93c9ac6468669ffd56d3a7354e7',
      tokenId: 0,
    },
    {
      contractAddress: '0x49ef0d791c4139cb66d11b26c25493618aebd41c',
      tokenId: 0,
    },
    {
      contractAddress: '0xe28ece5681b5ac1f8bd636b2734c5b9e13f32c19',
      tokenId: 0,
    },
    {
      contractAddress: '0xccda7598cebb433a48f36b98110f6f67812a80f9',
      tokenId: 0,
    },
    {
      contractAddress: '0x933650cc99fd556734afad5a608ad74604aab3dc',
      tokenId: 0,
    },
    {
      contractAddress: '0x4823E7Fd47DC20daD512F5174980964D187F313c',
      tokenId: 0,
    },
    {
      contractAddress: '0xd0813aF04D92672F9578fa78d429639a0555bC08',
      tokenId: 0,
    },
    {
      contractAddress: '0xa066DbDd1e81933587F0fDAA5c7d4B65C5F0247E',
      tokenId: 0,
    },
    {
      contractAddress: '0x945E32081ebC3F1e0ab18B6f9475F6c45e73d3aD',
      tokenId: 0,
    },
    {
      contractAddress: '0xDcbE29eFE76350173e5Da9c2F137024f13deD5F7',
      tokenId: 0,
    },
    {
      contractAddress: '0xeF211ea20663ec888067670B1126B8A06A108841',
      tokenId: 0,
    },
  ]

  const from = deployer.address
  const to = garbageCollectorAddress
  const data = '0x00'

  for (var contractIndex = 0; contractIndex < tokens.length; contractIndex++) {
    const token = tokens[contractIndex]

    const dropStarERC1155 = await hre.ethers.getContractAt(
      'ERC1155',
      token.contractAddress,
    )

    let tokenId = 0
    let found = true
    while (found) {
      const amount = (await dropStarERC1155.balanceOf(from, tokenId)).toString()

      if (amount === '0') found = false
      else {
        console.log(
          `${token.contractAddress}[tokenId=${tokenId}] --> ${amount}`,
        )

        await dropStarERC1155.safeTransferFrom(from, to, tokenId, amount, data)
      }
      tokenId++
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

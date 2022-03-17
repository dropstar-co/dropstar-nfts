const hre = require('hardhat')

const {
  NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  DROPSTAR_METAMASK_ADDRESS,
  PLASTIK_BODIES_NFT_7_TICKETS_TOKEN_ID,
} = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const nft = await hre.ethers.getContractAt(
    'DropStarERC1155',
    NFT_PLASTIK_BODIES_CONTRACT_ADDRESS,
  )

  const numberOfTickets = (await nft.totalSupply(6)).toNumber()
  console.log({ numberOfTickets })

  if (numberOfTickets < 100) {
    console.log('Minting for DROPSTAR METAMASK')

    console.log({
      DROPSTAR_METAMASK_ADDRESS,
      PLASTIK_BODIES_NFT_7_TICKETS_TOKEN_ID,
    })
    return
    await nft.mintBatch(
      DROPSTAR_METAMASK_ADDRESS,
      [PLASTIK_BODIES_NFT_7_TICKETS_TOKEN_ID],
      [50],
      '0x00',
    )
    console.log('    minted')
  } else {
    console.log('There are already 100 tickets')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

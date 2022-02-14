const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  const to = "0xCaf1456048790166f636ed24273804aFC5e67a0D"
  const tokenAddress = "0x86d75abe8e4d078380e8d335edcd7c86c623b4fc"
  const tokenId = 0
  const from = deployer.address;
  const data = "0x00"
  const amount = 1

  const erc1155 = await hre.ethers.getContractAt("ERC1155", tokenAddress);

  await erc1155.safeTransferFrom( from, to, tokenId, amount, data)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

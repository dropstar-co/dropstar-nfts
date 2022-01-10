// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();
  
  const DropStarERC1155 = await hre.ethers.getContractFactory("DropStarERC1155");
  const dropStarERC1155 = await DropStarERC1155.deploy();

  await dropStarERC1155.deployed();

  console.log("dropStarERC1155 deployed to:", dropStarERC1155.address);

  const dropstarDeveloper = "0x5e14b4D9af29066153C9ee3fC2563c95784a687a";
  const tokenID = 0;
  const amount  =1 ;
  const calldata = "0x00";

  console.log("Sending to dropstarDeveloper")

  await dropStarERC1155.mint(deployer.address, 0,1, calldata);
  await dropStarERC1155.mint(deployer.address, 1,10, calldata);
  await dropStarERC1155.mint(deployer.address, 2,20, calldata);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

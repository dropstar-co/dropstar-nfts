const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  const contractAddresses = [
    "0x9612eaa118f1a93c9ac6468669ffd56d3a7354e7",
    "0x49ef0d791c4139cb66d11b26c25493618aebd41c",
    "0xe28ece5681b5ac1f8bd636b2734c5b9e13f32c19",
    "0xccda7598cebb433a48f36b98110f6f67812a80f9",
    "0x933650cc99fd556734afad5a608ad74604aab3dc",
    "0x4823E7Fd47DC20daD512F5174980964D187F313c",
    "0xd0813aF04D92672F9578fa78d429639a0555bC08",
    "0xa066DbDd1e81933587F0fDAA5c7d4B65C5F0247E",
    "0x945E32081ebC3F1e0ab18B6f9475F6c45e73d3aD"
  ]
  const tokenID = 0 ;
  const dropstarDeveloper = "0x5e14b4d9af29066153c9ee3fc2563c95784a687a";

  const dummyNFT = await hre.ethers.getContractAt("ERC1155", "0x2953399124f0cbb46d2cbacd8a89cf0599974963");
  const uri_dummy = await dummyNFT.uri(0)
  const  balance_dummy = await dummyNFT.balanceOf(dropstarDeveloper,"42553992891219984983126389820265221838647002681979716060980732704314978467850")
  
console.log({ dummyNFT,uri_dummy,balance_dummy})
console.log({contractAddresses})

for (var i = 0; i < contractAddresses.length; i++) {
  const contractAddress = contractAddresses[i]
 
    const dropStarERC1155 = await hre.ethers.getContractAt("DropStarERC1155", contractAddress);
    const uri = await dropStarERC1155.uri(0)
    const balance =  await dropStarERC1155.balanceOf(dropstarDeveloper,tokenID)

    console.log({contractAddress,uri,balance})
    
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

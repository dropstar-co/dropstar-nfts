const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DropStarERC1155", function () {
  it("Should exist when deployed", async function () {
    const DropStarERC1155 = await ethers.getContractFactory("DropStarERC1155");
    const ageOfSmartMachine = await DropStarERC1155.deploy();
    await ageOfSmartMachine.deployed();

    await ageOfSmartMachine.uri(0)
  });

  it("Should be able to get/set uri per tokenID", async function () {


    const [deployer] = await ethers.getSigners();
    
    const DropStarERC1155 = await ethers.getContractFactory("DropStarERC1155");
    const ageOfSmartMachine = await DropStarERC1155.deploy();
    await ageOfSmartMachine.deployed();

    await ageOfSmartMachine.mint(deployer.address, 1,1, "0x00");
    await ageOfSmartMachine.mint(deployer.address, 2,1, "0x00");
    
  });

  
});

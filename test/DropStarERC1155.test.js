const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DropStarERC1155", function () {
  it("Should exist when deployed", async function () {
    const DropStarERC1155 = await ethers.getContractFactory("DropStarERC1155");
    const ageOfSmartMachine = await DropStarERC1155.deploy();
    await ageOfSmartMachine.deployed();

    const uri = await ageOfSmartMachine.uri(0)
    console.log(uri)

    /*expect (await ageOfSmartMachine.uri(0).to.equal(0));*/
  });

  it("Should be able to get/set uri per tokenID", async function () {


    const [deployer] = await ethers.getSigners();
    
    const DropStarERC1155 = await ethers.getContractFactory("DropStarERC1155");
    const ageOfSmartMachine = await DropStarERC1155.deploy();
    await ageOfSmartMachine.deployed();

    await ageOfSmartMachine.mint(deployer.address, 1,1, "0x00");
    await ageOfSmartMachine.mint(deployer.address, 2,1, "0x00");

    await ageOfSmartMachine.setURI(0, "URI0")
    await ageOfSmartMachine.setURI(1, "URI1")
    await ageOfSmartMachine.setURI(2, "URI2")
    

    const uri_0 = await ageOfSmartMachine.uri(0);
    expect(uri_0).to.equal("URI0");
    const uri_1 = await ageOfSmartMachine.uri(1);
    expect(uri_1).to.equal("URI1");
    const uri_2 = await ageOfSmartMachine.uri(2);
    expect(uri_2).to.equal("URI2");

    
  });

  
});

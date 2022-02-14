require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('hardhat-abi-exporter');

const {
  ALCHEMY_API_KEY_MUMBAI,
  ALCHEMY_API_KEY_MAINNET,
  DEPLOYER_PRIVATE_KEY,
} = require("./.env.js")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY_MUMBAI}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`]
    },
    ethereum : {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY_MAINNET}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`]
    }
  }
};

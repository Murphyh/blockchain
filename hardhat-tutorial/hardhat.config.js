const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
  },
  paths: {
    artifacts:"./client/src/artifacts",
  }
};

task("accounts","Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts){
    console.log(account.address)
  }
})

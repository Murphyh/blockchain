/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: {
    version: "0.8.4",
  },
  paths: {
    artifacts:"./client/src/artifacts",
  }
};

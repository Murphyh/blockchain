# hardhat cmdline 
1. mkdir 
2. npm init --yes
3. npm i --save-dev hardhat
4. npx hardhat
5. npm i @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle chain ethereum-waffle ethers

6. add line in hardhat.config.js

require("@nomiclabs/hardhat-waffle");

7. npx hardhat test

8. npm install --save chai

9.npx hardhat run --network localhost scripts/1_deploy.js

10.npx hardhat node
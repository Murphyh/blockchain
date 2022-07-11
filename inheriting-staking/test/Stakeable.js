const { expect } = require("chai")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const utils = require("./utils/Utils");

// import "../contracts/Token.sol"


describe('Stakeable',function(){
    beforeEach(async function(){
        [signer1, signer2, signer3] = await ethers.getSigners()
        Stakeable = await ethers.getContractFactory('Stakeable',signer1);
        stakeable = await Stakeable.deploy();

        Token = await ethers.getContractFactory('Token',signer1);
        token = await Token.deploy("Test","T",3,5000000);

    });

    describe('function',function(){
        it("Staking 100x2", async () => {
    
            // Stake 100 is used to stake 100 tokens twice and see that stake is added correctly and money burned
            let owner = signer1.address;
            // Set owner, user and a stake_amount
            let stake_amount = 100;
            // Add som tokens on signer2 asweel
            await token.mint(signer2.address, 1000);
            // Get init balance of user
            balance = await token.balanceOf(owner)

            console.log("init balalnce: ", balance)
            console.log("init totalsup: ", await token.totalSupply())



            await token.stake(stake_amount)
            after_balance = await token.balanceOf(owner)


            console.log("after balalnce: ", after_balance)
            console.log("after totalsup: ", await token.totalSupply())

    
            // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be
            await expect(token.stake(stake_amount)).to.emit(
                 token,"Staked"
            ).withArgs(signer1.address,100,1,anyValue)

            after_balance = await token.balanceOf(owner)


            console.log("after balalnce2: ", after_balance)
            console.log("after totalsup2: ", await token.totalSupply())

    
            // Stake again on owner because we want hasStake test to assert summary
            await expect(token.stake(stake_amount+1)).to.emit(
                token,"Staked"
           ).withArgs(signer1.address,101,1,anyValue)
        });

        it("new stakeholder should have increased index", async () => {
            let stake_amount = 200;
            // Add som tokens on signer2 asweel
            await token.mint(signer2.address, 1000);

            await expect(token.connect(signer1).stake(stake_amount)).to.emit(
                token,"Staked"
            ).withArgs(signer1.address,stake_amount,1,anyValue)

            await expect(token.connect(signer2).stake(stake_amount)).to.emit(
                token,"Staked"
            ).withArgs(signer2.address,stake_amount,2,anyValue)
            
        });

        it("cannot stake more than owning", async () => {

            // Stake too much on accounts[2]
            await token.mint(signer2.address, 1000);

            await expect(token.connect(signer2).stake(1000000000)).to.be.revertedWith("Token: Cannot stake more than you own");

        });

        it("cant withdraw bigger amount than current stake", async() => {
            // Try withdrawing 200 from first stake

            let stake_amount = 100;
            let withdraw_amount = 200;
            // Add som tokens on signer2 asweel
            await token.mint(signer2.address, stake_amount);
            after_balance = await token.balanceOf(signer2.address)

            console.log( "after_balance: ",after_balance)
            await token.connect(signer2).stake(100)
            await expect(token.connect(signer2).withdrawStake(1000000000,0)).to.be.revertedWith("Staking: Cannot withdraw more than you have staked");

        });

        it("withdraw 50 from a stake", async() => {
    
            let owner = signer1.address;
            let withdraw_amount = 20;
            await token.mint(signer1.address, 100);
            await token.connect(signer1).stake(100)


            // Try withdrawing 50 from first stake
            await token.withdrawStake(withdraw_amount, 0);
            // Grab a new summary to see if the total amount has changed
            let summary = await token.hasStake(owner);

            expect(summary.total_amount).to.equal(100-20)
        });

        it("remove stake if empty", async() => {
    
            let withdraw_amount = 50;
            await token.mint(signer2.address, withdraw_amount);

            await token.connect(signer2).stake(withdraw_amount);
            // Try withdrawing 50 from first stake AGAIN, this should empty the first stake
            await token.connect(signer2).withdrawStake(withdraw_amount, 0);
            // Grab a new summary to see if the total amount has changed
            let summary = await token.hasStake(signer2.address);

            expect(summary.stakes[0].user).to.equal("0x0000000000000000000000000000000000000000")

        });

        it("calculate rewards", async() => {
    
            let owner = signer1.address;
    
            // Owner has 1 stake at this time, its the index 1 with 100 Tokens staked
            // So lets fast forward time by 20 Hours and see if we gain 2% reward
            //const newBlock = await utils.advanceTimeAndBlock(3600*20);
            // let summary = await devToken.hasStake(owner);
    
            
            // let stake = summary.stakes[1];
            // assert.equal(stake.claimable, 100*0.02, "Reward should be 2 after staking for twenty hours with 100")
            // // Make a new Stake for 1000, fast forward 20 hours again, and make sure total stake reward is 24 (20+4)
            // // Remember that the first 100 has been staked for 40 hours now, so its 4 in rewards.
            // await devToken.stake(1000, {from: owner});
            // await helper.advanceTimeAndBlock(3600*20);
    
            // summary = await devToken.hasStake(owner);
    
            // stake = summary.stakes[1];
            // let newstake = summary.stakes[2];
    
            // assert.equal(stake.claimable, (100*0.04), "Reward should be 4 after staking for 40 hours")
            // assert.equal(newstake.claimable, (1000*0.02), "Reward should be 20 after staking 20 hours");
        });
    

    });

})

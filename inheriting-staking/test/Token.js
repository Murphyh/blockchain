const { expect } = require("chai")

describe('Token',function(){
    beforeEach(async function(){
        [signer1, signer2, signer3] = await ethers.getSigners()
        Token = await ethers.getContractFactory('Token',signer1);
        token = await Token.deploy("Test","T",3,5000000);
    });

    describe('function',function(){
        it('initial supply', async function(){
            expect(await token.totalSupply()).to.equal(5000000)
        });

        it("mint token", async() => {
        
            let intial_balance = await token.balanceOf(signer1.address);
            let intial_supply = await token.totalSupply();
            // Let's mint 100 tokens to the user and grab the balance again
            await token.mint(signer1.address, 100);
            let after_balance = await token.balanceOf(signer1.address);
            let after_supply = await token.totalSupply();
            // Let's verify the balance
            
            expect(after_balance).to.equal(intial_balance.toNumber() + 100)
            expect(after_supply).to.equal(intial_supply.toNumber() + 100)
            await expect(token.mint('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWith('Token: cannot mint to zero address');
        })
        it("burn token", async() => {

            // Let's continue on signer1 since that signer1 now has 5000000 tokens
            let initial_balance = await token.balanceOf(signer1.address);
            let intial_supply = await token.totalSupply();

            // Burn to address 0 
            await expect(token.burn('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWith('Token: cannot burn from zero address');
            // Burn more than balance
            await expect(token.burn(signer1.address, initial_balance + 1)).to.be.revertedWith('Token: Cannot burn more than the account owns');

            // Burn success with less than totalSupply
            await token.burn(signer1.address, initial_balance.sub(1000))

            let after_balance = await token.balanceOf(signer1.address);
            let after_supply = await token.totalSupply();


            // Make sure balance was reduced and that totalSupply reduced
            expect(after_balance).to.equal(1000)
            expect(after_supply).to.equal(1000)
        })

        it("transfering tokens", async() => {

            // Let's continue on signer1 since that signer1 now has 5000000 tokens
            let signer1_initial_balance = await token.balanceOf(signer1.address);
            let signer2_initial_balance = await token.balanceOf(signer2.address);

            // transfer tokens from account 0 to 1 
            await token.transfer(signer2.address, 1000000);
        
            let signer1_after1_balance = await token.balanceOf(signer1.address);
            let signer2_after1_balance = await token.balanceOf(signer2.address);

            expect(signer1_after1_balance).to.equal(signer1_initial_balance.sub(1000000))
            expect(signer2_after1_balance).to.equal(signer2_initial_balance.add(1000000))
    
            // We can change the msg.sender using the FROM value in function calls.
            await token.transfer(signer2.address, 100, { from: signer1.address});
            // Make sure balances are switched on both accounts
            let signer1_after2_balance = await token.balanceOf(signer1.address);
            let signer2_after2_balance = await token.balanceOf(signer2.address);

            expect(signer1_after2_balance).to.equal(signer1_after1_balance.sub(100))
            expect(signer2_after2_balance).to.equal(signer2_after1_balance.add(100))

            // Try transfering more than the signer1 owns
            await expect(token.transfer(signer2.address, signer1_initial_balance, { from: signer1.address})).to.be.revertedWith('Token: cant transfer more than your account holds');

        })

        it ("allow account some allowance", async() => {

            // Approve cannot be to zero address
            await expect(token.approve('0x0000000000000000000000000000000000000000',100)).to.be.revertedWith('Token: approve cannot be to zero address');

            // Give account 1 access too 100 tokens on zero account
            await token.approve(signer2.address, 100);  

            // Verify by checking allowance
            let allowance = await token.allowance(signer1.address, signer2.address);
            expect(allowance.toNumber()).to.equal(100)
        })

    })

    it("transfering with allowance", async() => {
        // Account 1 should have 100 tokens by now to use on account 0 
        // lets try using more 
        await expect(token.transferFrom(signer1.address, signer2.address, 200, {from: signer1.address})).to.be.revertedWith('Token: You cannot spend that much on this account');
        
        let init_allowance = await token.allowance(signer1.address, signer2.address);
        console.log("init balalnce: ", init_allowance.toNumber())

        // Account 1 should have 100 tokens by now to use on account 0 
        await token.approve(signer2.address, 100)
        init_allowance = await token.allowance(signer1.address, signer2.address);

        console.log("init balalnce2: ", init_allowance.toNumber())

        // lets try using more 
        await token.connect(signer2).transferFrom(signer1.address, signer3.address, 50);

        // Make sure allowance was changed
        let allowance = await token.allowance(signer1.address, signer2.address);
        expect(allowance.toNumber()).to.equal(50)        
    })

});

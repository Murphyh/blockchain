const { expect } = require("chai")
describe('EtherStaking',function(){
    beforeEach(async function(){
        [signer1, signer2] = await ethers.getSigners()

        EtherStaking = await ethers.getContractFactory('EtherStaking',signer1);

        etherStaking = await EtherStaking.deploy({
            value: ethers.utils.parseEther('10')
        });
    });

    describe('deploy',function(){
        it('should set owner', async function(){
            expect(await etherStaking.owner()).to.equal(signer1.address)
        });
        it('sets up tiers and lockPeriods', async function (){
            expect(await etherStaking.dayLockPeriods(0)).to.equal(30)
            expect(await etherStaking.dayLockPeriods(1)).to.equal(90)
            expect(await etherStaking.dayLockPeriods(2)).to.equal(180)

            expect(await etherStaking.getTierbyId(30)).to.equal(7)
            expect(await etherStaking.getTierbyId(90)).to.equal(10)
            expect(await etherStaking.getTierbyId(180)).to.equal(12)
        }) ;
    })

    describe('stakeEther', function(){
        it('transfers ether', async function (){
            const provider = waffle.provider;
            let contractBalance;
            let signerBalance;
            const transferAmount = ethers.utils.parseEther('2.0')

            contractBalance = await provider.getBalance(etherStaking.address)
            signerBalance = await signer1.getBalance()

            const data = { value: transferAmount}
            const transaction = await etherStaking.connect(signer1).stakeEther(30,data);
            const receipt = await transaction.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)

            //test the change in signer1's ether balance
            expect(
                await signer1.getBalance()
            ).to.equal(signerBalance.sub(transferAmount).sub(gasUsed))

            // test the change in contract's ether balance
            expect(
                await provider.getBalance(etherStaking.address)
            ).to.equal(contractBalance.add(transferAmount))
        })
    })
})
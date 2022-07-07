const { expect } = require("chai")

describe('Ownable',function(){
    beforeEach(async function(){
        [signer1, signer2] = await ethers.getSigners()

        Ownable = await ethers.getContractFactory('Ownable',signer1);

        ownable = await Ownable.deploy();
    });

    describe('deploy',function(){
        it('should set owner', async function(){
            expect(await ownable.owner()).to.equal(signer1.address)
        });
    })

    describe('function',function(){
        it("transfer ownership", async function(){
            await ownable.transferredOwnership(signer2.address)
            expect(await ownable.owner()).to.equal(signer2.address)
        });
    
        it("onlyOwner modifier", async () => {
            
            // Try executing a Transfer from accounts 2 
            try {
                await ownable.transferredOwnership(signer2.address, { from: signer2.address});
            }catch(error){
                await ownable.transferredOwnership(signer2.address, { from: signer1.address});
            }
        });
    
        it("renounce ownership", async () => {
    
            // renounce from accounts 1 as it is the new owner
            await ownable.renounceOwnership({ from: signer1.address});
            expect(await ownable.owner()).to.equal('0x0000000000000000000000000000000000000000')                
        })
    })
})


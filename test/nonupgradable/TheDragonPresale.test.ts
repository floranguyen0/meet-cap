import hre, { ethers, upgrades, waffle } from 'hardhat';
import chai from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import TheDragonPresaleArtifact from '../../artifacts/contracts/contracts-nonupgradable/thedragon/TheDragonPresale.sol/TheDragonPresale.json';
import { TheDragon } from '../../typechain-types/TheDragon';
import { TheDragonPresale } from '../../typechain-types/TheDragonPresale';
import { parseEther } from '@ethersproject/units';
import { ContractTransaction } from '@ethersproject/contracts';

const { deployContract } = waffle;
const { BigNumber } = ethers;
const { expect } = chai;


describe('TheDragonPresale', () => {
    let theDragon: TheDragon;
    let TheDragonPresale: TheDragonPresale;
    let deployer: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const zeroAddress = ethers.constants.AddressZero;
    // 1500 token units a buyer gets per wei.
    // Token price is 1/1500 Matic per token
    const rate = 1500;
    // Presale Amount is 300m tokens
    const presaleAmount = parseEther('300000000');

    beforeEach(async () => {
        [deployer, addr1, addr2] = await ethers.getSigners();
        const TheDragon = await hre.ethers.getContractFactory('TheDragon');
        theDragon = (await upgrades.deployProxy(TheDragon, [], { initializer: "initialize" })) as TheDragon;

        await theDragon.deployed();

        TheDragonPresale = (await deployContract(
            deployer, TheDragonPresaleArtifact,
            [rate, theDragon.address])) as TheDragonPresale;

        await theDragon.transfer(TheDragonPresale.address, presaleAmount);
    })

    it('Test TheDragonPresale metadata', async function () {
        expect(await TheDragonPresale.rate()).equal(rate);
        expect(await TheDragonPresale.token()).equal(theDragon.address);
        expect(await TheDragonPresale.owner()).equal(deployer.address);
        expect(await theDragon.balanceOf(TheDragonPresale.address)).equal(presaleAmount);
    })


    describe('Test buyTokens() function', function () {
        describe('Test _preValidatePurchase() function', function () {
            it('Should revert when the beneficiary address is the zero address',
                async function () {
                    const tx = TheDragonPresale.connect(addr1).buyTokens(
                        zeroAddress, { value: parseEther('10') });

                    await expect(tx).revertedWith(
                        'Beneficiary address cannot be the zero address.'
                    );
                });

            it('Should revert when buy with 0 value', async function () {
                const tx = TheDragonPresale.connect(addr1).buyTokens(
                    addr1.address, { value: 0 });

                await expect(tx).revertedWith(
                    'You cannot buy with 0 MATIC.'
                );
            });

            it('Should revert when the token amount exceeds the presale balance',
                async function () {
                    const tx = TheDragonPresale.connect(addr1).buyTokens(
                        addr1.address, { value: presaleAmount.div(rate).mul(2) });

                    await expect(tx).revertedWith(
                        'Token amount exceeds the presale balance.'
                    );
                });

            it('Should revert if a user buy tokens when all tokens have sold out',
                async function () {
                    // Set the balance of addr1 to 500000000115863701807178 Wei
                    await ethers.provider.send("hardhat_setBalance", [
                        addr1.address,
                        "0x69E10DE7CFD76F49E04A",
                    ]);
                    await TheDragonPresale.connect(addr1).buyTokens(
                        addr1.address, { value: presaleAmount.div(rate) });

                    expect(await theDragon.balanceOf(TheDragonPresale.address)).equal(0);

                    const tx = TheDragonPresale.connect(addr1).buyTokens(
                        addr1.address, { value: 1 });

                    await expect(tx).revertedWith('Token amount exceeds the presale balance.');
                });
        });

        describe('Should execute buyTokens() correctly', function () {
            const investmentAmount = parseEther('10');
            const tokensBought = investmentAmount.mul(rate);
            let tx: ContractTransaction;

            beforeEach(async function () {
                tx = await TheDragonPresale.connect(addr1).buyTokens(
                    addr1.address, { value: investmentAmount });
            })

            it('Should transfer corresponding ethers to the presale contract', async function () {
                expect(await ethers.provider.getBalance(TheDragonPresale.address)).equal(investmentAmount);
            });

            it('Should update the _weiRaise', async function () {
                expect(await TheDragonPresale.weiRaised()).equal(investmentAmount);
            });

            it('Should decrease token amount of the presale contract', async function () {
                expect(await theDragon.balanceOf(TheDragonPresale.address))
                    .equal(presaleAmount.sub(tokensBought));
            });

            it('Should transfer tokens to the beneficiary', async function () {
                expect(await theDragon.balanceOf(addr1.address)).equal(tokensBought);
            });

            it('Should emit TokensPurchased event', async function () {
                expect(tx).emit(TheDragonPresale, 'TokensPurchased').withArgs(
                    addr1.address, addr1.address, investmentAmount, tokensBought
                )
            });
        });
    });


    describe('Test forwardFunds() function', function () {
        it('Should revert when the presale contract has insufficient balance to forward funds', async function () {
            await TheDragonPresale.connect(addr1).buyTokens(
                addr1.address, { value: parseEther('10') });

            const tx = TheDragonPresale.forwardFunds(parseEther('20'));
            await expect(tx).revertedWith('Insufficient balance');
        })

        it('Should revert when the presale contract has 0 balance', async function () {
            const tx = TheDragonPresale.forwardFunds(parseEther('10'));
            await expect(tx).revertedWith('Insufficient balance');
        });

        it('Should revert when not called by the owner', async function () {
            await TheDragonPresale.connect(addr1).buyTokens(
                addr1.address, { value: parseEther('10') });

            const tx = TheDragonPresale.connect(addr2).forwardFunds(parseEther('5'));
            await expect(tx).revertedWith('Ownable: caller is not the owner');
        });

        it('Should forward funds correctly', async function () {
            const ownerBalance = await deployer.getBalance();
            await TheDragonPresale.connect(addr1).buyTokens(
                addr1.address, { value: parseEther('10') });

            const tx = await TheDragonPresale.forwardFunds(parseEther('5'));
            const receipt = await tx.wait();
            const gasFee = BigNumber.from(receipt.gasUsed).mul(receipt.effectiveGasPrice);

            expect(await ethers.provider.getBalance(TheDragonPresale.address)).equal(parseEther('5'));
            expect(await deployer.getBalance()).equal(ownerBalance.add(parseEther('5')).sub(gasFee));
        });
    });


    describe('Test endPresale() function', function () {
        it('Should revert if a user buy tokens when the presale has ended',
            async function () {
                await TheDragonPresale.endPresale();
                const tx = TheDragonPresale.connect(addr1).buyTokens(
                    addr1.address, { value: 100 });

                await expect(tx).revertedWith('Token amount exceeds the presale balance.');
            });

        it('Should revert when not called by the owner', async function () {
            const tx = TheDragonPresale.connect(addr1).endPresale();

            await expect(tx).revertedWith('Ownable: caller is not the owner');
        });

        it('End presale before there is any users buying', async function () {
            const ownerBalance = await deployer.getBalance();
            const ownerTokens = await theDragon.balanceOf(deployer.address);

            const tx = await TheDragonPresale.endPresale();
            const receipt = await tx.wait();
            const gasFee = BigNumber.from(receipt.gasUsed).mul(receipt.effectiveGasPrice);

            expect((await deployer.getBalance())).equal(ownerBalance.sub(gasFee));
            expect(await theDragon.balanceOf(deployer.address)).equal(ownerTokens.add(presaleAmount));
        })

        it('Should end the presale correctly', async function () {
            const ownerBalance = await deployer.getBalance();
            const ownerTokens = await theDragon.balanceOf(deployer.address);
            const investmentAmount = parseEther('10');

            await TheDragonPresale.connect(addr1).buyTokens(
                addr1.address, { value: investmentAmount });

            const tx = await TheDragonPresale.endPresale();
            const receipt = await tx.wait();
            const gasFee = BigNumber.from(receipt.gasUsed).mul(receipt.effectiveGasPrice);

            expect((await deployer.getBalance()))
                .equal(ownerBalance.add(investmentAmount).sub(gasFee));
            expect(await theDragon.balanceOf(deployer.address))
                .equal(ownerTokens.add(presaleAmount.sub(investmentAmount.mul(rate))));
        });
    });
})

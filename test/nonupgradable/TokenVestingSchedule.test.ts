import hre, { ethers, upgrades, waffle } from 'hardhat';
import chai from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { EthUtils, daysToSeconds } from '../../utils/EthUtils';
import { TheDragon } from '../../typechain-types/TheDragon';
import { TokenVestingSchedule } from '../../typechain-types/TokenVestingSchedule'
import TokenVestingScheduleArtifact from '../../artifacts/contracts/contracts-nonupgradable/thedragon/TokenVestingSchedule.sol/TokenVestingSchedule.json';

const { deployContract } = waffle;
const { BigNumber } = ethers;
const { expect } = chai;


describe('TokenVestingSchedule', function () {
  let theDragon: TheDragon;
  let tokenVestingSchedule: TokenVestingSchedule;
  let deployer: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let owner: SignerWithAddress;

  const zeroAddress = ethers.constants.AddressZero;

  beforeEach(async function () {
    // deploy theDragon
    [deployer, beneficiary, owner] = await ethers.getSigners();
    const TheDragon = await hre.ethers.getContractFactory('TheDragon');
    theDragon = (await upgrades.deployProxy(TheDragon, [], { initializer: "initialize" })) as TheDragon;

    await theDragon.deployed();
  });


  describe('Register new lock', function () {
    describe('Reverted cases', function () {
      it('Should revert when unlock percent and unlock dates length do not match', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20],
          await EthUtils.latestBlockTimestamp()
        ];

        await expect(deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )).revertedWith('Unlock length does not match');
      });

      it('Should revert when total unlock percent is not equal 100', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20, 10],
          await EthUtils.latestBlockTimestamp()
        ];

        await expect(deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )).to.revertedWith('Total unlock percent is not equal to 100');
      });

      it('Should revert when the beneficiary address is the zero address', async function () {
        const args = [
          zeroAddress,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20, 20],
          await EthUtils.latestBlockTimestamp()
        ];

        await expect(deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )).to.revertedWith('Beneficiary address cannot be the zero address');

      });

      it('Should revert when the token address is the zero address', async function () {
        const args = [
          beneficiary.address,
          zeroAddress,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20, 20],
          await EthUtils.latestBlockTimestamp()
        ];

        await expect(deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )).to.revertedWith('Token address cannot be the zero address');
      });

      it('Should revert when the total allocation is zero', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          0,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20, 20],
          await EthUtils.latestBlockTimestamp()
        ];

        await expect(deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )).to.revertedWith('The total allocation must be greater than zero');
      });
    });


    describe('New lock should be stored correctly', function () {
      beforeEach(async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 20, 20, 20],
          await EthUtils.latestBlockTimestamp()
        ];

        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args)) as TokenVestingSchedule;
      })

      it('Should store the correct owner', async function () {
        expect(await tokenVestingSchedule.owner()).to.equal(deployer.address);
      });

      it('Should store the correct beneficiary', async function () {
        expect(await tokenVestingSchedule.beneficiary()).to.equal(beneficiary.address);
      });

      it('Should store the correct token', async function () {
        expect(await tokenVestingSchedule.token()).to.equal(theDragon.address);
      });

      it('Should store the correct total allocation', async function () {
        expect(await tokenVestingSchedule.totalAllocation()).to.equal(10);
      });

      it('Should store the correct released amount', async function () {
        expect(await tokenVestingSchedule.releasedAmount()).to.equal(0);
      });

      it('Should store the correct release Id', async function () {
        expect(await tokenVestingSchedule.releaseId()).to.equal(0);
      });

      it('Should store the correct lock durations', async function () {
        expect(await tokenVestingSchedule.lockDurations()).to.deep.equal([
          daysToSeconds(1),
          daysToSeconds(2),
          daysToSeconds(3),
          daysToSeconds(4),
          daysToSeconds(5),
        ]);
      });

      it('Should store the correct release percents', async function () {
        expect(await tokenVestingSchedule.releasePercents()).
          to.deep.equal([20, 20, 20, 20, 20]);
      });

      it('Should store the correct start date', async function () {
        expect(await tokenVestingSchedule.startTime()).to.equal(
          await EthUtils.latestBlockTimestamp());
      });
    })
  });


  describe('Release locked tokens', function () {
    describe('Reverted cases', function () {
      it(`Should revert when the current time is before release time`, async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];

        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(tokenVestingSchedule.address, 100);

        await expect(tokenVestingSchedule.connect(beneficiary).release()).to.be.revertedWith(
          'Current time is before release time'
        );

        // Release 1st phase
        ethers.provider.send('evm_increaseTime', [3600 * 24]);
        await tokenVestingSchedule.connect(beneficiary).release();

        // Should revert if users try to release 2nd phase
        await expect(tokenVestingSchedule.connect(beneficiary).release()).to.be.revertedWith(
          'Current time is before release time'
        );

        // Release 2nd, 3rd, 4th phase
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 3]);
        await tokenVestingSchedule.connect(beneficiary).release();

        // Should revert if users try to release 5th phase
        await expect(tokenVestingSchedule.connect(beneficiary).release()).to.be.revertedWith(
          'Current time is before release time'
        );
      });

      it('Should revert when all phases have already been released', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          10,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];
        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;
        await theDragon.transfer(tokenVestingSchedule.address, 100);

        // Release all phases
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 5]);
        await tokenVestingSchedule.connect(beneficiary).release();

        await expect(tokenVestingSchedule.connect(beneficiary).release()).to.be.revertedWith(
          'All phases have already been released'
        );
      });

      it('Should revert when contract has insufficient balance to withdraw', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          100,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];

        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(tokenVestingSchedule.address, 50);
        // Release all phases
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 5]);
        await expect(tokenVestingSchedule.connect(beneficiary).release()).to.be.revertedWith(
          'ERC20: transfer amount exceeds balance'
        );
      });
    })


    describe('Should release locked tokens correctly', function () {
      it('Should release locked tokens to correct beneficiary when unlock conditions are met', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          BigNumber.from(100_000_000).mul(
            BigNumber.from(10).pow(BigNumber.from(18))
          ),
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];
        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(
          tokenVestingSchedule.address,
          BigNumber.from(100_000_000).mul(
            BigNumber.from(10).pow(BigNumber.from(await theDragon.decimals()))
          )
        );
        const decimals = await theDragon.decimals();

        // Release 1st phase
        ethers.provider.send('evm_increaseTime', [3600 * 24]);
        await tokenVestingSchedule.release();
        expect(await theDragon.balanceOf(beneficiary.address)).to.equal(
          BigNumber.from(20_000_000).mul(
            BigNumber.from(10).pow(BigNumber.from(decimals))
          )
        );

        // Release 2nd 3rd phase
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 2]);
        await tokenVestingSchedule.release();
        expect(await theDragon.balanceOf(beneficiary.address)).to.equal(
          BigNumber.from(50_000_000).mul(
            BigNumber.from(10).pow(BigNumber.from(decimals))
          )
        );

        // Release remaining phase
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 2]);
        await tokenVestingSchedule.release();
        expect(await theDragon.balanceOf(beneficiary.address)).to.equal(
          BigNumber.from(100_000_000).mul(
            BigNumber.from(10).pow(BigNumber.from(decimals))
          )
        );
      });

      it('Should emit Release event with correct data', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          100,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];

        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(tokenVestingSchedule.address, 100);

        ethers.provider.send('evm_increaseTime', [3600 * 24]);
        await expect(tokenVestingSchedule.connect(beneficiary).release())
          .to.emit(tokenVestingSchedule, 'Released')
          .withArgs(20, 1,);

        ethers.provider.send('evm_increaseTime', [3600 * 24 * 4]);
        await expect(tokenVestingSchedule.connect(beneficiary).release())
          .to.emit(tokenVestingSchedule, 'Released')
          .withArgs(80, 5);
      });

      it('Just to check what maximum gas that release all phases at a time', async function () {
        const args = [
          beneficiary.address,
          theDragon.address,
          100,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          await EthUtils.latestBlockTimestamp()
        ];
        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(tokenVestingSchedule.address, 100);

        ethers.provider.send('evm_increaseTime', [3600 * 24 * 10]);
        await tokenVestingSchedule.release();

        expect(await theDragon.balanceOf(beneficiary.address)).to.equal(100);
      });

      it('Should set release dates correct', async function () {
        const originDate = await EthUtils.latestBlockTimestamp();
        const args = [
          beneficiary.address,
          theDragon.address,
          100,
          [
            daysToSeconds(1),
            daysToSeconds(2),
            daysToSeconds(3),
            daysToSeconds(4),
            daysToSeconds(5),
          ],
          [20, 20, 10, 25, 25],
          originDate
        ];
        tokenVestingSchedule = (await deployContract(
          deployer, TokenVestingScheduleArtifact, args
        )) as TokenVestingSchedule;

        await theDragon.transfer(tokenVestingSchedule.address, 100);

        const expectedReleaseDates = [
          originDate + daysToSeconds(1),
          originDate + daysToSeconds(5),
          originDate + daysToSeconds(5),
          originDate + daysToSeconds(5),
          originDate + daysToSeconds(5),
        ];

        // Move to 1st phase
        ethers.provider.send('evm_increaseTime', [3600 * 24]);
        await tokenVestingSchedule.connect(beneficiary).release();
        const releaseDates = await tokenVestingSchedule.releaseDates();

        expect(releaseDates[0]).to.equal(expectedReleaseDates[0]);

        // Move to last phase
        ethers.provider.send('evm_increaseTime', [3600 * 24 * 4]);
        await tokenVestingSchedule.connect(beneficiary).release();
        const releaseDates_2 = await tokenVestingSchedule.releaseDates();
        expect(releaseDates_2[0]).to.equal(expectedReleaseDates[0]);
        expect(releaseDates_2[1]).to.equal(expectedReleaseDates[1]);
        expect(releaseDates_2[2]).to.equal(expectedReleaseDates[2]);
        expect(releaseDates_2[3]).to.equal(expectedReleaseDates[3]);
        expect(releaseDates_2[4]).to.equal(expectedReleaseDates[4]);
      });
    });
  });
});
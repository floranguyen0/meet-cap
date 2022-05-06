import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { EthUtils } from '../../../utils/EthUtils';

async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const testAllocation = BigNumber.
        from(800_000_000).mul(BigNumber.from(10).pow(18));
    const testLockDurations = Array(31).fill(120).
        map((cliff, i) => cliff + 60 * i);
    const testReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy TokenVestingSchedule
    const TokenVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const tokenVestingSchedule = await TokenVestingSchedule.deploy(
        process.env.COMMUNITY_ADDRESS as string,
        process.env.MEETCAP_ADDRESS as string,
        testAllocation,
        testLockDurations,
        testReleasePercents,
        now
    );
    await tokenVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(tokenVestingSchedule.address, testAllocation);


    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('Meetcap timelock deployed to the address:', tokenVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('Test start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



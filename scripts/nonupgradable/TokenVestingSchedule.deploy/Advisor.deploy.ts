import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { daysToSeconds, EthUtils } from '../../../utils/EthUtils';


async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const advisorAllocation = BigNumber.
        from(200_000_000).mul(BigNumber.from(10).pow(18));
    const advisorLockDurations = Array(31).fill(daysToSeconds(180)).
        map((cliff, i) => cliff + daysToSeconds(30) * i);
    const advisorReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy AdvisorVestingSchedule
    const AdvisorVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const advisorVestingSchedule = await AdvisorVestingSchedule.deploy(
        process.env.ADVISOR_ADDRESS as string,
        process.env.THE_DRAGON_ADDRESS as string,
        advisorAllocation,
        advisorLockDurations,
        advisorReleasePercents,
        now
    );
    await advisorVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(advisorVestingSchedule.address, advisorAllocation);

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('Advisor timelock deployed to the address:', advisorVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('Advisor start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



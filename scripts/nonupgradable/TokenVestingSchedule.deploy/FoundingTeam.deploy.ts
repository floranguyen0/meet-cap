import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { daysToSeconds, EthUtils } from '../../../utils/EthUtils';


async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const foundingTeamAllocation = BigNumber.
        from(1_900_000_000).mul(BigNumber.from(10).pow(18));
    const foundingTeamLockDurations = Array(31).fill(daysToSeconds(180)).
        map((cliff, i) => cliff + daysToSeconds(30) * i);
    const foundingTeamReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy FoundingTeamVestingSchedule
    const FoundingTeamVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const foundingTeamVestingSchedule = await FoundingTeamVestingSchedule.deploy(
        process.env.FOUNDING_TEAM_ADDRESS as string,
        process.env.THE_DRAGON_ADDRESS as string,
        foundingTeamAllocation,
        foundingTeamLockDurations,
        foundingTeamReleasePercents,
        now
    );
    await foundingTeamVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(foundingTeamVestingSchedule.address, foundingTeamAllocation);

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('Founding team timelock deployed to the address:', foundingTeamVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('Founding team start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



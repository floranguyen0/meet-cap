import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { daysToSeconds, EthUtils } from '../../../utils/EthUtils';


async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const strategicPartnersAllocation = BigNumber.
        from(500_000_000).mul(BigNumber.from(10).pow(18));
    const strategicPartnersLockDurations = Array(31).fill(daysToSeconds(180)).
        map((cliff, i) => cliff + daysToSeconds(30) * i);
    const strategicPartnersReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy StrategicPartnersVestingSchedule
    const StrategicPartnersVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const strategicPartnersVestingSchedule = await StrategicPartnersVestingSchedule.deploy(
        process.env.STRATEGIC_PARTNERS_ADDRESS as string,
        process.env.THE_DRAGON_ADDRESS as string,
        strategicPartnersAllocation,
        strategicPartnersLockDurations,
        strategicPartnersReleasePercents,
        now
    );
    await strategicPartnersVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(strategicPartnersVestingSchedule.address, strategicPartnersAllocation);
    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('Strategic partners timelock deployed to the address:', strategicPartnersVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('Strategic partners start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



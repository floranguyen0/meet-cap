import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { daysToSeconds, EthUtils } from '../../../utils/EthUtils';


async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const privateSaleAllocation = BigNumber.
        from(100_000_000).mul(BigNumber.from(10).pow(18));
    const privateSaleLockDurations = Array(31).fill(daysToSeconds(180)).
        map((cliff, i) => cliff + daysToSeconds(30) * i);
    const privateSaleReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy PrivateSaleVestingSchedule
    const PrivateSaleVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const privateSaleVestingSchedule = await PrivateSaleVestingSchedule.deploy(
        process.env.PRIVATE_SALE_ADDRESS as string,
        process.env.THE_DRAGON_ADDRESS as string,
        privateSaleAllocation,
        privateSaleLockDurations,
        privateSaleReleasePercents,
        now
    );
    await privateSaleVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(privateSaleVestingSchedule.address, privateSaleAllocation);

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('PrivateSale timelock deployed to the address:', privateSaleVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('PrivateSale start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



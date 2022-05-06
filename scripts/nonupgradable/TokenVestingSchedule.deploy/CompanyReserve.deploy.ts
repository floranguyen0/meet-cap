import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
import { daysToSeconds, EthUtils } from '../../../utils/EthUtils';


async function main() {
    const [deployer] = await ethers.getSigners();

    const now = await EthUtils.latestBlockTimestamp();
    const companyReserveAllocation = BigNumber.
        from(1_500_000_000).mul(BigNumber.from(10).pow(18));
    const companyReserveLockDurations = Array(31).fill(daysToSeconds(180)).
        map((cliff, i) => cliff + daysToSeconds(30) * i);
    const companyReserveReleasePercents = [0].
        concat(Array(5).fill(5)).concat(Array(25).fill(3));

    // Deploy CompanyVestingSchedule
    const CompanyVestingSchedule = await hre.ethers.getContractFactory('TokenVestingSchedule');
    const companyVestingSchedule = await CompanyVestingSchedule.deploy(
        process.env.COMPANY_RESERVE_ADDRESS as string,
        process.env.THE_DRAGON_ADDRESS as string,
        companyReserveAllocation,
        companyReserveLockDurations,
        companyReserveReleasePercents,
        now
    );
    await companyVestingSchedule.deployed();

    // transfer tokens from the deployer to TimeLock
    const theDragon = await hre.ethers.getContractAt('TheDragon', process.env.THE_DRAGON_ADDRESS as string)
    await theDragon.transfer(companyVestingSchedule.address, companyReserveAllocation);

    // Deployment data
    const networkName = hre.network.name;
    console.log('Deploying to the network:', networkName);
    console.log('Company reserve timelock deployed to the address:', companyVestingSchedule.address);
    console.log("Deploying contracts by the account:", deployer.address);
    console.log('Company reserve start time:', now);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



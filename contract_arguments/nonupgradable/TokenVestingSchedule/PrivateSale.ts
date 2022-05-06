import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const privateSaleAllocation = BigNumber.
    from(100_000_000).mul(BigNumber.from(10).pow(18));
const privateSaleLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const privateSaleReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.PRIVATE_SALE_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    privateSaleAllocation,
    privateSaleLockDurations,
    privateSaleReleasePercents,
    1651747316
]

import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const marketingAllocation = BigNumber.
    from(750_000_000).mul(BigNumber.from(10).pow(18));
const marketingLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const marketingReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.MARKETING_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    marketingAllocation,
    marketingLockDurations,
    marketingReleasePercents,
    1651747150
]

import 'dotenv/config'
import { BigNumber } from 'ethers';


// cliff 2 mins, then unlock every minute
const testAllocation = BigNumber.
    from(800_000_000).mul(BigNumber.from(10).pow(18));
const testLockDurations = Array(31).fill(120).
    map((cliff, i) => cliff + 60 * i);
const testReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.COMMUNITY_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    testAllocation,
    testLockDurations,
    testReleasePercents,
    1651479346
]

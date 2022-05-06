import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const ecosystemAllocation = BigNumber.
    from(2_500_000_000).mul(BigNumber.from(10).pow(18));
const ecosystemLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const ecosystemReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.ECOSYSTEM_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    ecosystemAllocation,
    ecosystemLockDurations,
    ecosystemReleasePercents,
    1651744985
]

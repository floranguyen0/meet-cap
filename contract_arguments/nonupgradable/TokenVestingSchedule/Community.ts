import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const communityAllocation = BigNumber.
    from(800_000_000).mul(BigNumber.from(10).pow(18));
const communityLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const communityReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.COMMUNITY_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    communityAllocation,
    communityLockDurations,
    communityReleasePercents,
    1651744565
]

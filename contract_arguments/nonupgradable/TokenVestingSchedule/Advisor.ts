import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const advisorAllocation = BigNumber.
    from(200_000_000).mul(BigNumber.from(10).pow(18));
const advisorLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const advisorReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.ADVISOR_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    advisorAllocation,
    advisorLockDurations,
    advisorReleasePercents,
    1651743693
]

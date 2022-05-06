import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const strategicPartnersAllocation = BigNumber.
    from(500_000_000).mul(BigNumber.from(10).pow(18));
const strategicPartnersLockDurations = Array(31).fill(daysToSeconds(180)).
    map((cliff, i) => cliff + daysToSeconds(30) * i);
const strategicPartnersReleasePercents = [0].
    concat(Array(5).fill(5)).concat(Array(25).fill(3));

module.exports = [
    process.env.STRATEGIC_PARTNERS_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    strategicPartnersAllocation,
    strategicPartnersLockDurations,
    strategicPartnersReleasePercents,
    1651747806
]

import { daysToSeconds, } from '../../../utils/EthUtils';
import 'dotenv/config'
import { BigNumber } from 'ethers';


const publicSaleAllocation = BigNumber.
    from(1_450_000_000).mul(BigNumber.from(10).pow(18));
const publicSaleLockDurations = Array(5).fill(daysToSeconds(20)).
    map((cliff, i) => cliff * (i + 1));
const publicSaleReleasePercents = Array(5).fill(20);
module.exports = [
    process.env.PUBLIC_SALE_ADDRESS as string,
    process.env.THE_DRAGON_ADDRESS as string,
    publicSaleAllocation,
    publicSaleLockDurations,
    publicSaleReleasePercents,
    1651747616
]

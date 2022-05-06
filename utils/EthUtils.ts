import { BigNumber } from '@ethersproject/bignumber';
// @ts-ignore
import { ethers, timeAndMine } from 'hardhat';

export function daysToSeconds(day: number): number {
    return day * 60 * 60 * 24;
}

export namespace EthUtils {
    export async function increaseTime(delta: number) {
        await ethers.provider.send('evm_increaseTime', [delta]);
    }

    export async function latestBlockTimestamp(): Promise<number> {
        return (await ethers.provider.getBlock('latest')).timestamp;
    }

    export async function setBlockTimestamp(date: number) {
        await timeAndMine.setTime(date);
    }

    export async function setNextBlockTimestamp(date: number) {
        await ethers.provider.send('evm_setNextBlockTimestamp', [date]);
    }

    export function expandDecimals(amount: number, decimals: number): BigNumber {
        return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals));
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

library SafeMathX {
    // Calculate x * y / 100 rounding down.
    // x == totalAllocation, y == releasePercents[_releaseId]
    // return stepReleaseAmount
    function RoundDown(uint256 x, uint256 y) internal pure returns (uint256) {
        uint256 a = x / 100;
        uint256 b = x % 100;
        uint256 c = y / 100;
        uint256 d = y % 100;

        return a * c * 100 + a * d + b * c + (b * d) / 100;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../utils/RoundDown.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract TokenVestingSchedule is Ownable {
    using SafeMathX for uint256;

    // Beneficiary
    address private immutable _beneficiary;

    // Token address
    IERC20Upgradeable private immutable _token;

    // Total amount of locked tokens
    uint256 private immutable _totalAllocation;

    // Total amount of tokens have been released
    uint256 private _releasedAmount;

    // Current release phase
    uint32 private _releaseId;

    // Lock duration (in seconds) of each phase
    uint32[] private _lockDurations;

    // Release percent of each phase
    uint32[] private _releasePercents;

    // Dates the beneficiary executes a release for each phase
    uint64[] private _releaseDates;

    // Start date of the lockup period
    uint64 private immutable _startTime;

    event Released(uint256 releasableAmount, uint32 toIdx);

    constructor(
        address beneficiary_,
        IERC20Upgradeable token_,
        uint256 totalAllocation_,
        uint32[] memory lockDurations_,
        uint32[] memory releasePercents_,
        uint64 startTime_
    ) {
        require(lockDurations_.length == releasePercents_.length, "Unlock length does not match");

        uint256 _sum;
        for (uint256 i = 0; i < releasePercents_.length; ++i) {
            _sum += releasePercents_[i];
        }

        require(_sum == 100, "Total unlock percent is not equal to 100");

        require(beneficiary_ != address(0), "Beneficiary address cannot be the zero address");

        require(address(token_) != address(0), "Token address cannot be the zero address");

        require(totalAllocation_ > 0, "The total allocation must be greater than zero");

        _beneficiary = beneficiary_;
        _token = token_;
        _startTime = startTime_;
        _lockDurations = lockDurations_;
        _releasePercents = releasePercents_;
        _totalAllocation = totalAllocation_;
        _releasedAmount = 0;
        _releaseId = 0;
        _releaseDates = new uint64[](_lockDurations.length);
    }

    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }

    function token() public view virtual returns (IERC20Upgradeable) {
        return _token;
    }

    function totalAllocation() public view virtual returns (uint256) {
        return _totalAllocation;
    }

    function releasedAmount() public view virtual returns (uint256) {
        return _releasedAmount;
    }

    function releaseId() public view virtual returns (uint32) {
        return _releaseId;
    }

    function lockDurations() public view virtual returns (uint32[] memory) {
        return _lockDurations;
    }

    function releasePercents() public view virtual returns (uint32[] memory) {
        return _releasePercents;
    }

    function releaseDates() public view virtual returns (uint64[] memory) {
        return _releaseDates;
    }

    function startTime() public view virtual returns (uint64) {
        return _startTime;
    }

    /// @notice Release unlocked tokens to user.
    /// @dev User (sender) can release unlocked tokens by calling this function.
    /// This function will release locked tokens from multiple lock phases that meets unlock requirements
    function release() public virtual returns (bool) {
        uint256 phases = _lockDurations.length;
        _preValidateRelease(phases);

        uint256 preReleaseId = _releaseId;
        uint256 releasableAmount = _releasableAmount(phases);

        _releasedAmount += releasableAmount;
        _token.transfer(_beneficiary, releasableAmount);

        uint64 releaseDate = uint64(block.timestamp);

        for (uint256 i = preReleaseId; i < _releaseId; ++i) {
            _releaseDates[i] = releaseDate;
        }

        emit Released(releasableAmount, _releaseId);

        return true;
    }

    /// @dev This is for safety.
    /// For example, when someone setup the contract with wrong data and accidentally transfer token to the lockup contract.
    /// The owner can get the token back by calling this function.
    /// The ownership is renounced right after the setup is done safely.
    function safeSetup() public virtual onlyOwner returns (bool) {
        uint256 balance = _token.balanceOf(address(this));
        _token.transfer(owner(), balance);

        return true;
    }

    function _preValidateRelease(uint256 phases) internal view virtual {
        require(_releaseId < phases, "All phases have already been released");
        require(
            block.timestamp >= _startTime + _lockDurations[_releaseId] * 1 seconds,
            "Current time is before release time"
        );
    }

    function _releasableAmount(uint256 phases) internal virtual returns (uint256) {
        uint256 releasableAmount;
        while (_releaseId < phases && block.timestamp >= _startTime + _lockDurations[_releaseId] * 1 seconds) {
            uint256 stepReleaseAmount;
            if (_releaseId == phases - 1) {
                releasableAmount = _totalAllocation - _releasedAmount;
            } else {
                stepReleaseAmount = _totalAllocation.RoundDown(_releasePercents[_releaseId]);
                releasableAmount += stepReleaseAmount;
            }
            _releaseId++;
        }
        return releasableAmount;
    }
}

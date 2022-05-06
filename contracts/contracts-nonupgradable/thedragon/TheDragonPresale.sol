// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../../contracts-upgradable/thedragon/TheDragon.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TheDragonPresale is Context, ReentrancyGuard, Ownable {
    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    uint256 private _rate;

    //  The amount of wei raised
    uint256 private _weiRaised;

    //  The token being sold
    IERC20Upgradeable private _token;

    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 weiSent,
        uint256 tokensBought
    );

    constructor(uint256 rate_, IERC20Upgradeable token_) {
        require(rate_ > 0, "The token rate cannot be 0");

        require(address(token_) != address(0), "Token address cannot be the zero address");

        _rate = rate_;
        _token = token_;
    }

    receive() external payable {
        buyTokens(_msgSender());
    }

    function rate() public view virtual returns (uint256) {
        return _rate;
    }

    function weiRaised() public view virtual returns (uint256) {
        return _weiRaised;
    }

    function token() public view virtual returns (IERC20Upgradeable) {
        return _token;
    }

    function buyTokens(address beneficiary) public payable virtual nonReentrant returns (bool) {
        uint256 weiSent = msg.value;
        uint256 tokensBought = weiSent * _rate;

        _preValidatePurchase(beneficiary, weiSent, tokensBought);

        _weiRaised = _weiRaised + weiSent;

        _token.transfer(beneficiary, tokensBought);

        emit TokensPurchased(_msgSender(), beneficiary, weiSent, tokensBought);

        return true;
    }

    function forwardFunds(uint256 weiAmount) public virtual onlyOwner returns (bool) {
        require(address(this).balance >= weiAmount, "Insufficient balance");

        _transferEth(payable(owner()), weiAmount);

        return true;
    }

    function endPresale() public virtual onlyOwner returns (bool) {
        uint256 tokenBalance = _token.balanceOf(address(this));
        uint256 weiBalance = address(this).balance;

        _token.transfer(owner(), tokenBalance);
        _transferEth(payable(owner()), weiBalance);

        return true;
    }

    function _preValidatePurchase(
        address beneficiary,
        uint256 weiSent,
        uint256 tokensBought
    ) private view {
        require(beneficiary != address(0), "Beneficiary address cannot be the zero address.");
        require(weiSent != 0, "You cannot buy with 0 MATIC.");
        require(_token.balanceOf(address(this)) >= tokensBought, "Token amount exceeds the presale balance.");
    }

    function _transferEth(address payable beneficiary, uint256 weiAmount) private nonReentrant {
        (bool success, bytes memory data) = beneficiary.call{value: weiAmount}("");

        require(success, "Failed to send Ether");
    }
}

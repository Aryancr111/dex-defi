// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DEX.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Arbitrage {
    DEX public immutable dex1;
    DEX public immutable dex2;
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public constant FEE = 3;
    uint256 public constant FEE_DENOM = 1000;
    uint256 public constant MIN_PROFIT = 1e15; // 0.001 TokenA

    event ArbitrageExecuted(uint256 profitA);

    constructor(address _dex1, address _dex2) {
        dex1 = DEX(_dex1);
        dex2 = DEX(_dex2);
        tokenA = dex1.tokenA();
        tokenB = dex1.tokenB();
    }

    function executeArbitrage(uint256 amountA) external returns (uint256 profit) {
        require(amountA > 0, "Invalid capital");

        // Transfer capital from caller
        tokenA.transferFrom(msg.sender, address(this), amountA);

        // Approvals
        tokenA.approve(address(dex1), amountA);
        tokenA.approve(address(dex2), amountA);
        tokenB.approve(address(dex1), type(uint256).max);
        tokenB.approve(address(dex2), type(uint256).max);

        uint256 initialBalance = tokenA.balanceOf(address(this));

        uint256 p1 = _tryAtoBthenBtoA(dex1, dex2, amountA);
        uint256 p2 = _tryAtoBthenBtoA(dex2, dex1, amountA);

        profit = p1 > p2 ? p1 : p2;

        require(profit >= MIN_PROFIT, "No profitable arbitrage");

        uint256 finalBalance = tokenA.balanceOf(address(this));
        uint256 totalReturn = finalBalance;

        // Send back capital + profit
        tokenA.transfer(msg.sender, totalReturn);

        emit ArbitrageExecuted(profit);
    }

    function _tryAtoBthenBtoA(
        DEX buyDex,
        DEX sellDex,
        uint256 amountA
    ) private returns (uint256) {

        uint256 initialBalance = tokenA.balanceOf(address(this));

        // Swap A -> B
        buyDex.swapAForB(amountA);

        uint256 amountB = tokenB.balanceOf(address(this));

        // Swap B -> A
        sellDex.swapBForA(amountB);

        uint256 finalBalance = tokenA.balanceOf(address(this));

        if (finalBalance > initialBalance) {
            return finalBalance - initialBalance;
        }

        return 0;
    }
}
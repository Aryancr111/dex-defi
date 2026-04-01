// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LPToken.sol";

contract DEX {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    LPToken public immutable lpToken;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public constant FEE = 3; // 0.3%
    uint256 public constant FEE_DENOM = 1000;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpBurned);
    event Swap(address indexed trader, bool aToB, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB, address _lpToken) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        lpToken = LPToken(_lpToken);
    }

    function getSpotPrice() public view returns (uint256) {
        require(reserveA > 0, "No liquidity");
        return (reserveB * 1e18) / reserveA;
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    function getPriceAInB() external view returns (uint256) { 
        return getSpotPrice(); 
    }

    function getPriceBInA() external view returns (uint256) {
        require(reserveB > 0, "No liquidity");
        return (reserveA * 1e18) / reserveB;
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Zero amount");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        uint256 liquidity;

        if (reserveA == 0 && reserveB == 0) {
            liquidity = amountA;
        } else {
            require(amountA * reserveB == amountB * reserveA, "Ratio mismatch");
            liquidity = (amountA * lpToken.totalSupply()) / reserveA;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        if (reserveA == 0 && reserveB == 0) {
            reserveA = amountA;
            reserveB = amountB;
        } else {
            reserveA += amountA;
            reserveB += amountB;
        }

        lpToken.mint(msg.sender, liquidity);
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0, "Zero amount");
        uint256 total = lpToken.totalSupply();
        require(lpAmount <= lpToken.balanceOf(msg.sender), "Insufficient LP");

        uint256 amountAOut = (lpAmount * reserveA) / total;
        uint256 amountBOut = (lpAmount * reserveB) / total;

        lpToken.burn(msg.sender, lpAmount);

        reserveA -= amountAOut;
        reserveB -= amountBOut;

        tokenA.transfer(msg.sender, amountAOut);
        tokenB.transfer(msg.sender, amountBOut);

        emit LiquidityRemoved(msg.sender, amountAOut, amountBOut, lpAmount);
    }

    function swapAForB(uint256 amountAIn) external {
        _swap(true, amountAIn);
    }

    function swapBForA(uint256 amountBIn) external {
        _swap(false, amountBIn);
    }

    function _swap(bool aToB, uint256 amountIn) private {
        require(amountIn > 0, "Zero input");

        IERC20 input = aToB ? tokenA : tokenB;
        IERC20 output = aToB ? tokenB : tokenA;

        input.transferFrom(msg.sender, address(this), amountIn);

        uint256 amountInFee = (amountIn * (FEE_DENOM - FEE)) / FEE_DENOM;
        uint256 amountOut;

        if (aToB) {
            amountOut = (reserveB * amountInFee) / (reserveA + amountInFee);
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            amountOut = (reserveA * amountInFee) / (reserveB + amountInFee);
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        require(amountOut > 0, "Insufficient output");
        output.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, aToB, amountIn, amountOut);
    }
}
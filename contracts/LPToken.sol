// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address public dex;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function setDex(address _dex) external {
        require(dex == address(0), "DEX already set");
        dex = _dex;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == dex, "Only DEX can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == dex, "Only DEX can burn");
        _burn(from, amount);
    }
}
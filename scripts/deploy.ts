// scripts/deploy.ts
import { network } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
    const { ethers } = await network.connect("sepolia");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // ---------------- TOKEN ----------------
    const Token = await ethers.getContractFactory("Token", deployer);

    const tokenA = await Token.deploy("TokenA", "TKA");
    const tokenB = await Token.deploy("TokenB", "TKB");
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    // Mint tokens (WAIT REQUIRED)
    const txA = await tokenA.mint(deployer.address, ethers.parseEther("1000000"));
    await txA.wait();

    const txB = await tokenB.mint(deployer.address, ethers.parseEther("1000000"));
    await txB.wait();

    console.log("✅ Tokens deployed & minted");

    // ---------------- LP TOKENS ----------------
    const LPToken = await ethers.getContractFactory("LPToken", deployer);

    const lp1 = await LPToken.deploy("LP Token 1", "LPT1");
    const lp2 = await LPToken.deploy("LP Token 2", "LPT2");
    await lp1.waitForDeployment();
    await lp2.waitForDeployment();

    // ---------------- DEX ----------------
    const DEX = await ethers.getContractFactory("DEX", deployer);

    const dex1 = await DEX.deploy(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        await lp1.getAddress()
    );

    const dex2 = await DEX.deploy(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        await lp2.getAddress()
    );

    await dex1.waitForDeployment();
    await dex2.waitForDeployment();

    // Set DEX in LPToken (WAIT REQUIRED)
    const tx1 = await lp1.setDex(await dex1.getAddress());
    await tx1.wait();

    const tx2 = await lp2.setDex(await dex2.getAddress());
    await tx2.wait();

    console.log("✅ DEX + LP configured");

    // ---------------- LIQUIDITY ----------------
    const amountA1 = ethers.parseEther("1000");
    const amountB1 = ethers.parseEther("2000");

    const approveA1 = await tokenA.approve(await dex1.getAddress(), amountA1);
    await approveA1.wait();

    const approveB1 = await tokenB.approve(await dex1.getAddress(), amountB1);
    await approveB1.wait();

    const liq1 = await dex1.addLiquidity(amountA1, amountB1);
    await liq1.wait();

    console.log("✅ DEX1 liquidity added");

    // SECOND DEX (arb opportunity)
    const amountA2 = ethers.parseEther("1000");
    const amountB2 = ethers.parseEther("2100");

    const approveA2 = await tokenA.approve(await dex2.getAddress(), amountA2);
    await approveA2.wait();

    const approveB2 = await tokenB.approve(await dex2.getAddress(), amountB2);
    await approveB2.wait();

    const liq2 = await dex2.addLiquidity(amountA2, amountB2);
    await liq2.wait();

    console.log("✅ DEX2 liquidity added");

    // ---------------- ARBITRAGE ----------------
    const Arbitrage = await ethers.getContractFactory("Arbitrage", deployer);

    const arb = await Arbitrage.deploy(
        await dex1.getAddress(),
        await dex2.getAddress()
    );

    await arb.waitForDeployment();

    // ---------------- SAVE ----------------
    const addresses = {
        tokenA: await tokenA.getAddress(),
        tokenB: await tokenB.getAddress(),
        dex1: await dex1.getAddress(),
        dex2: await dex2.getAddress(),
        lp1: await lp1.getAddress(),
        lp2: await lp2.getAddress(),
        arbitrage: await arb.getAddress()
    };

    writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
    console.table(addresses);

    console.log("Deployment complete");
}

main().catch(console.error);
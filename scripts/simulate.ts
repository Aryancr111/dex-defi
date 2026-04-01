// scripts/simulate.ts
import { network } from "hardhat";
import fs from "fs";

async function main() {
    cconst { ethers } = await network.connect();

    const addresses = JSON.parse(fs.readFileSync("deployed-addresses.json", "utf8"));

    const dex = await ethers.getContractAt("DEX", addresses.dex1);
    const arb = await ethers.getContractAt("Arbitrage", addresses.arbitrage);
    const tokenA = await ethers.getContractAt("Token", addresses.tokenA);
    const tokenB = await ethers.getContractAt("Token", addresses.tokenB);
    const lpToken = await ethers.getContractAt("LPToken", addresses.lp1);

    const signers = (await ethers.getSigners()).slice(0, 13);
    const lpUsers = signers.slice(0, 5);

    const N = 75;
    let totalVolume = 0;
    let totalFees = 0;

    const records: any[] = [];

    for (let i = 0; i < N; i++) {
        const performer = signers[Math.floor(Math.random() * signers.length)];
        const isLP = lpUsers.includes(performer);

        const [beforeA, beforeB] = await dex.getReserves();

        let type = "";
        let slippage = 0;

        if (isLP && Math.random() < 0.3) {
            // ADD LIQUIDITY
            type = "deposit";

            const balA = await tokenA.balanceOf(performer.address);
            const amountA = balA / 10n;

            const amountB = beforeA > 0n ? (amountA * beforeB) / beforeA : amountA;

            await tokenA.connect(performer).approve(await dex.getAddress(), amountA);
            await tokenB.connect(performer).approve(await dex.getAddress(), amountB);

            try {
                await dex.connect(performer).addLiquidity(amountA, amountB);
            } catch {}
        }
        else if (isLP && Math.random() < 0.5) {
            // REMOVE
            type = "withdraw";

            const lpBal = await lpToken.balanceOf(performer.address);
            if (lpBal > 0n) {
                const amt = lpBal / 5n;
                await dex.connect(performer).removeLiquidity(amt);
            }
        }
        else {
            // SWAP
            type = "swap";

            const isAToB = Math.random() > 0.5;
            const tokenIn = isAToB ? tokenA : tokenB;

            const bal = await tokenIn.balanceOf(performer.address);
            const maxAllowed = isAToB ? beforeA / 10n : beforeB / 10n;

            const amountIn = bal < maxAllowed ? bal / 5n : maxAllowed;

            if (amountIn === 0n) continue;

            await tokenIn.connect(performer).approve(await dex.getAddress(), amountIn);

            const beforeOut = await (isAToB ? tokenB : tokenA).balanceOf(performer.address);

            if (isAToB) {
                await dex.connect(performer).swapAForB(amountIn);
            } else {
                await dex.connect(performer).swapBForA(amountIn);
            }

            const afterOut = await (isAToB ? tokenB : tokenA).balanceOf(performer.address);

            const received = afterOut - beforeOut;

            totalVolume += Number(amountIn) / 1e18;
            totalFees += Number(amountIn) * 0.003 / 1e18;

            const expected = beforeA > 0n
                ? (isAToB ? beforeB / beforeA : beforeA / beforeB)
                : 0n;

            const actual = amountIn > 0n ? received / amountIn : 0n;

            slippage = Number(actual - expected);
        }

        // Occasionally trigger arbitrage
        if (Math.random() < 0.1) {
            try {
                const trader = signers[0];
                const capital = ethers.parseEther("100");

                await tokenA.connect(trader).approve(addresses.arbitrage, capital);
                await arb.connect(trader).executeArbitrage(capital);
            } catch {}
        }

        const [resA, resB] = await dex.getReserves();
        const ratio = resA > 0n ? Number(resB) / Number(resA) : 0;

        const tvl = Number(resA) / 1e18 + Number(resB) / 1e18;

        records.push({
            tx: i + 1,
            type,
            reserveA: Number(resA) / 1e18,
            reserveB: Number(resB) / 1e18,
            ratio,
            tvl,
            slippage,
            volume: totalVolume,
            fees: totalFees,
            lpSupply: Number(await lpToken.totalSupply()) / 1e18
        });
    }

    fs.writeFileSync(
        "simulation.csv",
        "tx,type,reserveA,reserveB,ratio,tvl,slippage,volume,fees,lpSupply\n" +
        records.map(r =>
            `${r.tx},${r.type},${r.reserveA},${r.reserveB},${r.ratio},${r.tvl},${r.slippage},${r.volume},${r.fees},${r.lpSupply}`
        ).join("\n")
    );

    console.log("✅ Simulation complete");
}

main().catch(console.error);
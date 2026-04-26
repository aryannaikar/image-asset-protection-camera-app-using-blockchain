const hre = require("hardhat");

async function main() {
  console.log("Deploying RealityShield contract...");

  const RealityShield = await hre.ethers.getContractFactory("RealityShield");
  const realityShield = await RealityShield.deploy();

  await realityShield.waitForDeployment();

  const address = await realityShield.getAddress();

  console.log(`RealityShield deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

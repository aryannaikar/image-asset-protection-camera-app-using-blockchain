const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealityShield", function () {
  let RealityShield;
  let realityShield;
  let owner;
  let otherAccount;

  const sampleHash = "5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9"; // SHA-256 for "0"

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    RealityShield = await ethers.getContractFactory("RealityShield");
    realityShield = await RealityShield.deploy();
  });

  describe("Storing Proofs", function () {
    it("Should store a new proof and emit an event", async function () {
      await expect(realityShield.storeProof(sampleHash))
        .to.emit(realityShield, "ProofStored")
        .withArgs(sampleHash, owner.address, (val) => true);
    });

    it("Should fail if the proof already exists", async function () {
      await realityShield.storeProof(sampleHash);
      await expect(realityShield.storeProof(sampleHash))
        .to.be.revertedWith("Proof already exists for this hash");
    });
  });

  describe("Verifying Proofs", function () {
    it("Should return correct data for a stored proof", async function () {
      await realityShield.storeProof(sampleHash);
      const [exists, proofOwner, timestamp] = await realityShield.verifyProof(sampleHash);
      
      expect(exists).to.equal(true);
      expect(proofOwner).to.equal(owner.address);
      expect(timestamp).to.be.gt(0);
    });

    it("Should return false for a non-existent proof", async function () {
      const [exists, proofOwner, timestamp] = await realityShield.verifyProof("nonexistent");
      expect(exists).to.equal(false);
      expect(proofOwner).to.equal(ethers.ZeroAddress);
      expect(timestamp).to.equal(0);
    });
  });
});

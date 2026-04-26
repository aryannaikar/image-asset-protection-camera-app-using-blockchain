// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RealityShield
 * @dev Stores proof of image authenticity using SHA-256 hashes.
 */
contract RealityShield {
    struct Proof {
        address owner;
        uint256 timestamp;
    }

    // Mapping from SHA-256 hash string to Proof metadata
    mapping(string => Proof) public proofs;

    // Event emitted when a new proof is stored
    event ProofStored(string sha, address indexed owner, uint256 timestamp);

    /**
     * @dev Stores proof of an image by its SHA-256 hash.
     * @param sha The SHA-256 hash of the image.
     */
    function storeProof(string memory sha) public {
        // Ensure the proof doesn't already exist
        require(proofs[sha].timestamp == 0, "Proof already exists for this hash");

        proofs[sha] = Proof({
            owner: msg.sender,
            timestamp: block.timestamp
        });

        emit ProofStored(sha, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifies if a proof exists for a given SHA-256 hash.
     * @param sha The SHA-256 hash to verify.
     * @return exists Boolean indicating if proof exists.
     * @return owner The address of the proof owner.
     * @return timestamp The time when the proof was recorded.
     */
    function verifyProof(string memory sha) public view returns (bool exists, address owner, uint256 timestamp) {
        Proof memory proof = proofs[sha];
        
        if (proof.timestamp == 0) {
            return (false, address(0), 0);
        }
        
        return (true, proof.owner, proof.timestamp);
    }
}

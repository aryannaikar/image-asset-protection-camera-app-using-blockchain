/**
 * Calculates the Hamming distance between two hexadecimal strings.
 * Used for comparing perceptual hashes (pHash).
 * @param {string} a - First hash string
 * @param {string} b - Second hash string
 * @returns {number} - Hamming distance
 */
exports.hammingDistance = (a, b) => {
  // Convert hex to binary
  const hexToBin = (hex) => {
    let bin = "";
    for (let i = 0; i < hex.length; i++) {
      bin += parseInt(hex[i], 16).toString(2).padStart(4, "0");
    }
    return bin;
  };

  const binA = hexToBin(a);
  const binB = hexToBin(b);

  if (binA.length !== binB.length) {
    return Math.max(binA.length, binB.length);
  }
  
  let dist = 0;
  for (let i = 0; i < binA.length; i++) {
    if (binA[i] !== binB[i]) dist++;
  }
  return dist;
};

/**
 * Checks if two hashes are similar based on a threshold.
 * @param {string} a - First hash string
 * @param {string} b - Second hash string
 * @param {number} threshold - Maximum Hamming distance for similarity (default 40 for 256-bit hashes)
 * @returns {boolean} - True if similar, false otherwise
 */
exports.isSimilar = (a, b, threshold = 40) => {
  const dist = exports.hammingDistance(a, b);
  console.log(`[pHash] Distance: ${dist} (threshold: ${threshold}) => ${dist <= threshold ? 'MATCH' : 'NO MATCH'}`);
  return dist <= threshold;
};

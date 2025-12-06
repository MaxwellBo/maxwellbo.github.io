/**
 * Calculate the parity (XOR of all bits) of a byte
 * @param {number} x - An 8-bit value
 * @returns {number} - 1 if odd number of 1s, 0 if even
 */
function parity(x) {
  let t = 0;
  for (let i = 0; i < 8; i++) {
    t ^= (x >> i) & 1;
  }
  return t;
}

/**
 * Perform affine transformation on a single byte
 * @param {bigint} matrixQword - 64-bit value containing the 8x8 bit matrix (8 bytes, each byte is a row)
 * @param {number} srcByte - Input byte to transform
 * @param {number} constantByte - Constant byte to XOR with result
 * @returns {number} - Transformed byte
 */
function affineByte(matrixQword, srcByte, constantByte) {
  let result = 0;
  
  for (let i = 0; i < 8; i++) {
    // Extract the (7-i)th byte from the matrix (row for output bit i)
    // Per Intel spec: retbyte.bit[i] := parity(tsrc2qw.byte[7-i] AND src1byte) XOR imm8.bit[i]
    // Byte 7 defines output bit 0, byte 6 defines output bit 1, etc.
    const matrixRow = Number((matrixQword >> BigInt((7 - i) * 8)) & 0xFFn);
    
    // Compute parity of (matrix row AND input byte)
    const bit = parity(matrixRow & srcByte);
    
    // XOR with the corresponding bit from the constant
    const resultBit = bit ^ ((constantByte >> i) & 1);
    
    // Set the bit in the result
    result |= (resultBit << i);
  }
  
  return result;
}

/**
 * GF2P8AFFINEQB - Galois Field Affine Transformation
 * 
 * Computes affine transformation in GF(2^8) on packed bytes.
 * For each qword (8 bytes) in src1, applies the transformation:
 *   result = matrix * byte + constant
 * where matrix is from the corresponding qword in src2, and constant is from imm8.
 * 
 * @param {Uint8Array} src1 - First source operand (x values, 16 bytes for 128-bit)
 * @param {Uint8Array} src2 - Second source operand (matrix values, 16 bytes for 128-bit)
 * @param {number} imm8 - Immediate byte (b constant for all transformations)
 * @returns {Uint8Array} - Result of affine transformations (16 bytes)
 */
function gf2p8affineqb(src1, src2, imm8) {
  const result = new Uint8Array(16);
  
  // Process 2 qwords (2 * 8 bytes = 16 bytes total for 128-bit)
  for (let qwordIdx = 0; qwordIdx < 2; qwordIdx++) {
    // Extract the qword from src2 as a 64-bit matrix
    let matrixQword = 0n;
    for (let byteIdx = 0; byteIdx < 8; byteIdx++) {
      matrixQword |= BigInt(src2[qwordIdx * 8 + byteIdx]) << BigInt(byteIdx * 8);
    }
    
    // Apply affine transformation to each byte in the qword
    for (let byteIdx = 0; byteIdx < 8; byteIdx++) {
      const srcByte = src1[qwordIdx * 8 + byteIdx];
      result[qwordIdx * 8 + byteIdx] = affineByte(matrixQword, srcByte, imm8);
    }
  }
  
  return result;
}

// Export functions for use in tests or other modules
export { gf2p8affineqb, affineByte, parity };

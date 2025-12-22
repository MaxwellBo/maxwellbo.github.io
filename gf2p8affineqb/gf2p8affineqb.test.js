import { test, expect, describe } from "bun:test";
import { gf2p8affineqb, affineByte, parity } from './gf2p8affineqb.js';

/**
 * Test helper to create a Uint8Array from an array of numbers
 * @param {number[]} values 
 * @returns {Uint8Array}
 */
function bytes(values) {
  return new Uint8Array(values);
}

describe('parity', () => {
  test('parity of 0 is 0 (even)', () => {
    expect(parity(0b00000000)).toBe(0);
  });

  test('parity of 1 is 1 (odd)', () => {
    expect(parity(0b00000001)).toBe(1);
  });

  test('parity of 0xFF is 0 (8 ones = even)', () => {
    expect(parity(0b11111111)).toBe(0);
  });

  test('parity of 0x7F is 1 (7 ones = odd)', () => {
    expect(parity(0b01111111)).toBe(1);
  });

  test('parity of 0b10101010 is 0 (4 ones = even)', () => {
    expect(parity(0b10101010)).toBe(0);
  });

  test('parity of 0b10101011 is 1 (5 ones = odd)', () => {
    expect(parity(0b10101011)).toBe(1);
  });
});

describe('affineByte', () => {
  test('identity matrix with zero constant', () => {
    // Identity matrix: each byte has a single bit set
    // Byte 7 (row for output bit 0): 00000001 = 0x01
    // Byte 6 (row for output bit 1): 00000010 = 0x02
    // Byte 5 (row for output bit 2): 00000100 = 0x04
    // Byte 4 (row for output bit 3): 00001000 = 0x08
    // Byte 3 (row for output bit 4): 00010000 = 0x10
    // Byte 2 (row for output bit 5): 00100000 = 0x20
    // Byte 1 (row for output bit 6): 01000000 = 0x40
    // Byte 0 (row for output bit 7): 10000000 = 0x80
    const identityMatrix = 0x0102040810204080n;
    expect(affineByte(identityMatrix, 0b10110011, 0x00)).toBe(0b10110011);
  });

  test('zero matrix with constant', () => {
    const zeroMatrix = 0x0000000000000000n;
    expect(affineByte(zeroMatrix, 0xFF, 0b10101010)).toBe(0b10101010);
  });

  test('all ones matrix', () => {
    // Each row is 0xFF, so parity of (0xFF & input) for each bit position
    const allOnesMatrix = 0xFFFFFFFFFFFFFFFFn;
    // For input 0b10110011 (5 ones = odd parity)
    // Each output bit will be: odd XOR constant_bit
    expect(affineByte(allOnesMatrix, 0b10110011, 0x00)).toBe(0xFF); // All bits odd
    expect(affineByte(allOnesMatrix, 0b10110011, 0xFF)).toBe(0x00); // All bits inverted
  });
});

describe('gf2p8affineqb', () => {
  test('identity transformation on all zeros', () => {
    const identityMatrix = 0x0102040810204080n;
    
    // Create src2 with identity matrix in both qwords
    const src2 = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      src2[i] = Number((identityMatrix >> BigInt(i * 8)) & 0xFFn);
      src2[8 + i] = Number((identityMatrix >> BigInt(i * 8)) & 0xFFn);
    }
    
    const src1 = bytes([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = gf2p8affineqb(src1, src2, 0x00);
    
    expect(result).toEqual(src1);
  });

  test('identity transformation with non-zero input', () => {
    const identityMatrix = 0x0102040810204080n;
    
    const src2 = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      src2[i] = Number((identityMatrix >> BigInt(i * 8)) & 0xFFn);
      src2[8 + i] = Number((identityMatrix >> BigInt(i * 8)) & 0xFFn);
    }
    
    const src1 = bytes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const result = gf2p8affineqb(src1, src2, 0x00);
    
    expect(result).toEqual(src1);
  });

  test('constant only (zero matrix)', () => {
    const src1 = bytes([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    const src2 = new Uint8Array(16); // All zeros
    const constant = 0b10101010;
    
    const result = gf2p8affineqb(src1, src2, constant);
    
    // All output bytes should be the constant
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBe(constant);
    }
  });

  test('bit reversal transformation', () => {
    // Matrix that reverses bits (from Wunkolo's article):
    // Byte 7 (output bit 0): 10000000 = 0x80 (input bit 7)
    // Byte 6 (output bit 1): 01000000 = 0x40 (input bit 6)
    // Byte 5 (output bit 2): 00100000 = 0x20 (input bit 5)
    // Byte 4 (output bit 3): 00010000 = 0x10 (input bit 4)
    // Byte 3 (output bit 4): 00001000 = 0x08 (input bit 3)
    // Byte 2 (output bit 5): 00000100 = 0x04 (input bit 2)
    // Byte 1 (output bit 6): 00000010 = 0x02 (input bit 1)
    // Byte 0 (output bit 7): 00000001 = 0x01 (input bit 0)
    const reverseMatrix = 0x8040201008040201n;
    
    const src2 = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      src2[i] = Number((reverseMatrix >> BigInt(i * 8)) & 0xFFn);
      src2[8 + i] = Number((reverseMatrix >> BigInt(i * 8)) & 0xFFn);
    }
    
    const src1 = bytes([0b10000000, 0b11000000, 0b10101010, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0]);
    const result = gf2p8affineqb(src1, src2, 0x00);
    
    expect(result[0]).toBe(0b00000001); // 0b10000000 reversed
    expect(result[1]).toBe(0b00000011); // 0b11000000 reversed
    expect(result[2]).toBe(0b01010101); // 0b10101010 reversed
  });

  test('sign extension example (5-bit to 8-bit)', () => {
    // This is a practical use case: extending the sign bit of a 5-bit value
    // For a 5-bit value stored in bits 0-4, we want to extend bit 4 to bits 5-7
    //
    // Byte 7 (output bit 0): 00000001 = 0x01 (input bit 0)
    // Byte 6 (output bit 1): 00000010 = 0x02 (input bit 1)
    // Byte 5 (output bit 2): 00000100 = 0x04 (input bit 2)
    // Byte 4 (output bit 3): 00001000 = 0x08 (input bit 3)
    // Byte 3 (output bit 4): 00010000 = 0x10 (input bit 4)
    // Byte 2 (output bit 5): 00010000 = 0x10 (input bit 4)
    // Byte 1 (output bit 6): 00010000 = 0x10 (input bit 4)
    // Byte 0 (output bit 7): 00010000 = 0x10 (input bit 4)
    const signExtendMatrix = 0x0102040810101010n;
    
    const src2 = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      src2[i] = Number((signExtendMatrix >> BigInt(i * 8)) & 0xFFn);
      src2[8 + i] = Number((signExtendMatrix >> BigInt(i * 8)) & 0xFFn);
    }
    
    // Test positive 5-bit value: 0b00001111 (15, bit 4 = 0)
    const src1_pos = new Uint8Array(16);
    src1_pos[0] = 0b00001111;
    const result_pos = gf2p8affineqb(src1_pos, src2, 0x00);
    // Result: bit 0-3 should be 1, bit 4-7 should be 0
    expect(result_pos[0]).toBe(0b00001111); // No sign extension needed
    
    // Test negative 5-bit value: 0b00011111 (bit 4 = 1, others = 1)
    const src1_neg = new Uint8Array(16);
    src1_neg[0] = 0b00011111;
    const result_neg = gf2p8affineqb(src1_neg, src2, 0x00);
    // Result: bit 0-4 should be 1, bit 5-7 should be 1 (sign extended)
    expect(result_neg[0]).toBe(0b11111111); // Sign extended
  });
});

import { gf2p8affineqb, affineByte, parity } from './gf2p8affineqb.js';

/**
 * Create a visualization of the GF2P8AFFINEQB operation
 * @param {HTMLElement} container - The container element to render into
 * @param {Uint8Array} src1 - First source operand (16 bytes)
 * @param {Uint8Array} src2 - Second source operand (matrix, 16 bytes)
 * @param {number} imm8 - Immediate byte constant
 * @param {boolean} keepDetailsOpen - Whether to keep the details element open
 */
export function createVisualization(container, src1, src2, imm8, title, description) {
  // Check if details was previously open
  const previousDetails = container.querySelector('details');
  const wasOpen = previousDetails ? previousDetails.open : false;
  
  container.innerHTML = '';
  
  const titleEl = document.createElement('h4');
  titleEl.textContent = title;
  container.appendChild(titleEl);
  
  if (description) {
    const descEl = document.createElement('p');
    descEl.textContent = description;
    descEl.classList.add('gf2p8-description');
    container.appendChild(descEl);
  }
  
  const result = gf2p8affineqb(src1, src2, imm8);
  
  // Show first byte transformation in detail
  const byteIdx = 0;
  const qwordIdx = 0;
  
  // Extract matrix for first qword
  let matrixQword = 0n;
  for (let i = 0; i < 8; i++) {
    matrixQword |= BigInt(src2[qwordIdx * 8 + i]) << BigInt(i * 8);
  }
  
  // Main visualization container - horizontal layout like the image
  const vizContainer = document.createElement('div');
  vizContainer.classList.add('gf2p8-viz-container');
  
  // Matrix section (left side)
  const matrixContainer = document.createElement('div');
  const matrixGrid = document.createElement('div');
  matrixGrid.classList.add('gf2p8-matrix-grid');
  
  // Matrix rows (row 7 to row 0, top to bottom - flipped to match visualization)
  for (let row = 7; row >= 0; row--) {
    for (let col = 7; col >= 0; col--) {
      const byteIndex = (7 - row);
      const bitPosition = col;
      const bit = (src2[byteIndex] >> bitPosition) & 1;
      
      const cell = document.createElement('div');
      cell.textContent = bit;
      cell.classList.add('gf2p8-cell', 'interactive');
      
      // Color coding based on bit value
      if (bit) {
        cell.classList.add('one');
      } else {
        cell.classList.add('zero');
      }
      
      // Add click handler to toggle bit
      cell.addEventListener('click', () => {
        src2[byteIndex] ^= (1 << bitPosition);
        createVisualization(container, src1, src2, imm8, title, description);
      });
      
      matrixGrid.appendChild(cell);
    }
  }
  matrixContainer.appendChild(matrixGrid);
  vizContainer.appendChild(matrixContainer);
  
  // Multiplication operator
  const xLabel = document.createElement('div');
  xLabel.textContent = '×';
  xLabel.classList.add('gf2p8-operator');
  vizContainer.appendChild(xLabel);
  
  // Input vector section
  const inputContainer = document.createElement('div');
  const inputGrid = document.createElement('div');
  inputGrid.classList.add('gf2p8-vector-grid');
  
  // Display bits from 7 to 0 (top to bottom)
  for (let bit = 7; bit >= 0; bit--) {
    const bitValue = (src1[byteIdx] >> bit) & 1;
    const cell = document.createElement('div');
    cell.textContent = bitValue;
    cell.classList.add('gf2p8-cell', 'interactive');
    
    if (bitValue) {
      cell.classList.add('one');
    } else {
      cell.classList.add('zero');
    }
    
    // Add click handler to toggle bit
    cell.addEventListener('click', () => {
      src1[byteIdx] ^= (1 << bit);
      createVisualization(container, src1, src2, imm8, title, description);
    });
    
    inputGrid.appendChild(cell);
  }
  inputContainer.appendChild(inputGrid);
  vizContainer.appendChild(inputContainer);
  
  // XOR operator
  const xorLabel = document.createElement('div');
  xorLabel.textContent = '+';
  xorLabel.classList.add('gf2p8-operator');
  vizContainer.appendChild(xorLabel);
  
  // Constant vector section
  const constantContainer = document.createElement('div');
  const constantGrid = document.createElement('div');
  constantGrid.classList.add('gf2p8-vector-grid');
  
  // Create a mutable reference for imm8
  let mutableImm8 = imm8;
  
  for (let bit = 7; bit >= 0; bit--) {
    const bitValue = (mutableImm8 >> bit) & 1;
    const cell = document.createElement('div');
    cell.textContent = bitValue;
    cell.classList.add('gf2p8-cell', 'interactive');
    
    if (bitValue) {
      cell.classList.add('one');
    } else {
      cell.classList.add('zero');
    }
    
    // Add click handler to toggle bit
    cell.addEventListener('click', () => {
      mutableImm8 ^= (1 << bit);
      createVisualization(container, src1, src2, mutableImm8, title, description);
    });
    
    constantGrid.appendChild(cell);
  }
  constantContainer.appendChild(constantGrid);
  vizContainer.appendChild(constantContainer);
  
  // Equals sign
  const equalsLabel = document.createElement('div');
  equalsLabel.textContent = '=';
  equalsLabel.classList.add('gf2p8-operator');
  vizContainer.appendChild(equalsLabel);
  
  // Result vector section with annotations
  const resultContainer = document.createElement('div');
  const resultGrid = document.createElement('div');
  resultGrid.classList.add('gf2p8-result-grid');
  
  // Display bits from 7 to 0 (top to bottom)
  for (let bit = 7; bit >= 0; bit--) {
    const bitValue = (result[byteIdx] >> bit) & 1;
    
    // Result bit cell
    const cell = document.createElement('div');
    cell.textContent = bitValue;
    cell.classList.add('gf2p8-cell');
    
    if (bitValue) {
      cell.classList.add('result-one');
    } else {
      cell.classList.add('zero');
    }
    
    resultGrid.appendChild(cell);
    
    // Annotation
    const annotation = document.createElement('div');
    annotation.classList.add('gf2p8-annotation');
    
    // Determine which input bit this comes from based on the matrix
    const matrixByte = Number((matrixQword >> BigInt((7 - bit) * 8)) & 0xFFn);
    let sourceBits = [];
    for (let i = 0; i < 8; i++) {
      if ((matrixByte >> i) & 1) {
        sourceBits.push(i);
      }
    }
    
    if (sourceBits.length === 1) {
      annotation.textContent = `Copy bit ${sourceBits[0]}`;
    } else if (sourceBits.length > 1) {
      annotation.textContent = `Parity of bits ${sourceBits.join(', ')}`;
    } else {
      annotation.textContent = `Constant`;
    }
    
    resultGrid.appendChild(annotation);
  }
  resultContainer.appendChild(resultGrid);
  vizContainer.appendChild(resultContainer);
  
  container.appendChild(vizContainer);
  
  // C++ code example
  const cppSection = document.createElement('details');
  cppSection.classList.add('gf2p8-cpp-section');
  
  const cppSummary = document.createElement('summary');
  cppSummary.textContent = 'C++ implementation';
  cppSummary.classList.add('gf2p8-cpp-summary');
  cppSection.appendChild(cppSummary);
  
  const cppCode = document.createElement('pre');
  cppCode.classList.add('gf2p8-cpp-code');
  
  const constantHex = '0x' + imm8.toString(16).padStart(2, '0');
  const matrixHex = '0x' + matrixQword.toString(16).padStart(16, '0');
  
  // Format the input and expected result for the assert
  const inputHex = '0x' + src1[byteIdx].toString(16).padStart(2, '0');
  const expectedResult = '0x' + result[byteIdx].toString(16).padStart(2, '0');
  
  // Generate matrix construction with binary literals
  let matrixConstruction = '';
  for (let i = 0; i < 8; i++) {
    const byteIndex = i;
    const byteVal = src2[byteIndex];
    const binStr = byteVal.toString(2).padStart(8, '0');
    const shift = i * 8;
    matrixConstruction += `  (uint64_t(0b${binStr}) << ${shift})${i < 7 ? ' |' : ''}\n`;
  }

  cppCode.textContent = `// ${matrixHex}
const uint64_t matrix = 
${matrixConstruction};
const __m128i k_matrix = _mm_set1_epi64x(matrix);
const __m128i dataToTransform = _mm_set_epi8(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ${inputHex});
const __m128i result = _mm_gf2p8affine_epi64_epi8(dataToTransform, k_matrix, ${constantHex});

const uint8_t resultByte = _mm_extract_epi8(result, 0);
assert(resultByte == ${expectedResult});`;
  
  cppSection.appendChild(cppCode);
  
  // Set the open state based on previous state
  cppSection.open = wasOpen;
  
  container.appendChild(cppSection);
}

/**
 * Create a matrix from bytes for visualization
 * @param {number[]} bytes - 8 bytes representing the matrix rows
 * @returns {bigint} The 64-bit matrix value
 */
export function createMatrix(bytes) {
  let matrix = 0n;
  for (let i = 0; i < 8; i++) {
    matrix |= BigInt(bytes[i]) << BigInt(i * 8);
  }
  return matrix;
}

/**
 * Helper to create src2 array from a matrix value
 * @param {bigint} matrix - The 64-bit matrix
 * @returns {Uint8Array} 16-byte array with matrix in both qwords
 */
export function matrixToSrc2(matrix) {
  const src2 = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const byte = Number((matrix >> BigInt(i * 8)) & 0xFFn);
    src2[i] = byte;
    src2[8 + i] = byte;
  }
  return src2;
}

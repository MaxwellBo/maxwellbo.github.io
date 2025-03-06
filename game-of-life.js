// Game of Life implementation
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('gameOfLife');
  if (!canvas) return; // Exit if canvas not found
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Create two grids for double buffering
  let grid = new Uint8Array(width * height);
  let nextGrid = new Uint8Array(width * height);
  
  // Initialize with a glider gun pattern (Gosper's glider gun)
  function initializeGrid() {
    // Clear the grid
    grid.fill(0);
    
    // Add a Gosper glider gun pattern
    const pattern = [
      [0, 4], [0, 5], [1, 4], [1, 5], // Block
      [10, 4], [10, 5], [10, 6], [11, 3], [11, 7], [12, 2], [12, 8], [13, 2], [13, 8], [14, 5], [15, 3], [15, 7], [16, 4], [16, 5], [16, 6], [17, 5], // Left side of gun
      [20, 2], [20, 3], [20, 4], [21, 2], [21, 3], [21, 4], [22, 1], [22, 5], [24, 0], [24, 1], [24, 5], [24, 6], // Right side of gun
      [34, 2], [34, 3], [35, 2], [35, 3] // Block
    ];
    
    // Place the pattern in the center of the grid
    const offsetX = Math.floor(width / 2) - 20;
    const offsetY = Math.floor(height / 2) - 10;
    
    pattern.forEach(([x, y]) => {
      const gridX = x + offsetX;
      const gridY = y + offsetY;
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        grid[gridY * width + gridX] = 1;
      }
    });
  }
  
  // Function to get the state of a cell
  function getCell(x, y) {
    // Check if coordinates are outside the grid
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return 0; // Return 0 (dead) for cells outside the grid
    }
    return grid[y * width + x];
  }
  
  // Function to count live neighbors
  function countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        count += getCell(x + dx, y + dy);
      }
    }
    return count;
  }
  
  // Function to update the grid
  function updateGrid() {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const neighbors = countNeighbors(x, y);
        const alive = grid[idx] === 1;
        
        // Apply Conway's Game of Life rules
        if (alive && (neighbors < 2 || neighbors > 3)) {
          nextGrid[idx] = 0; // Dies from loneliness or overcrowding
        } else if (alive && (neighbors === 2 || neighbors === 3)) {
          nextGrid[idx] = 1; // Survives
        } else if (!alive && neighbors === 3) {
          nextGrid[idx] = 1; // Birth
        } else {
          nextGrid[idx] = 0; // Remains dead
        }
      }
    }
    
    // Swap grids
    [grid, nextGrid] = [nextGrid, grid];
  }
  
  // Function to render the grid
  function renderGrid() {
    // Create an ImageData object
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Fill the ImageData
    for (let i = 0; i < grid.length; i++) {
      const value = grid[i] ? 0 : 255; // Invert colors: 0 for black (alive cells), 255 for white (dead cells)
      const idx = i * 4;
      data[idx] = value;     // R
      data[idx + 1] = value; // G
      data[idx + 2] = value; // B
      data[idx + 3] = 255;   // A (always fully opaque)
    }
    
    // Put the ImageData on the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  
  // Animation loop
  function animate() {
    updateGrid();
    renderGrid();
    requestAnimationFrame(animate);
  }
  
  // Initialize and start the animation
  initializeGrid();
  renderGrid();
  requestAnimationFrame(animate);
  
  // Add click interaction to add random cells
  canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    
    // Add a random pattern around the clicked point
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const nx = (x + dx + width) % width;
        const ny = (y + dy + height) % height;
        if (Math.random() > 0.7) {
          grid[ny * width + nx] = 1;
        }
      }
    }
  });
}); 
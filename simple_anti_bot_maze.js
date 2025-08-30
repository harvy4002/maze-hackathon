/**
 * Simple Anti-Bot Maze Generator
 * Creates mazes specifically designed to challenge pathfinding algorithms
 * 
 * Usage: node simple_anti_bot_maze.js <outputFile> <size>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 3) {
  console.error('Usage: node simple_anti_bot_maze.js [outputFile] <size>');
  process.exit(1);
}

// Check if only size is provided
let outputFile, size;
if (process.argv.length === 3) {
  size = parseInt(process.argv[2]);
  outputFile = `mazes/anti_bot_maze_${size}.json`;
} else {
  outputFile = process.argv[2];
  size = parseInt(process.argv[3]);
}

// Validate size
if (isNaN(size) || size < 10) {
  console.error('Size must be a number greater than or equal to 10');
  process.exit(1);
}

/**
 * Generate a maze specifically designed to challenge bot pathfinding algorithms
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {Object} The generated maze object
 */
function generateAntiBotMaze(width, height) {
  console.log(`Generating anti-bot maze with dimensions ${width}x${height}...`);
  
  // Initialize the grid: 1 = wall, 0 = passage
  const grid = Array(height).fill().map(() => Array(width).fill(1));
  
  // Create the basic maze structure (perfect maze)
  createBaseMaze(grid, width, height);
  console.log("Basic maze structure created");
  
  // Choose strategic start and end points that are distant
  const { start, end } = placeStartEnd(grid, width, height);
  console.log(`Start: [${start[0]}, ${start[1]}], End: [${end[0]}, ${end[1]}]`);
  
  // Add deceptive paths that will mislead A* heuristics
  const deceptivePathsAdded = addDeceptivePaths(grid, width, height, start, end);
  console.log(`Added ${deceptivePathsAdded} deceptive paths`);
  
  // Add memory-intensive regions (many branching paths)
  const memoryRegionsAdded = addMemoryIntensiveRegions(grid, width, height);
  console.log(`Added ${memoryRegionsAdded} memory-intensive regions`);
  
  // Add strategic loops to confuse the bot
  const loopsAdded = addStrategicLoops(grid, width, height);
  console.log(`Added ${loopsAdded} strategic loops`);
  
  // Ensure path validity
  const pathLength = ensureValidPath(grid, width, height, start, end);
  console.log(`Final path length: ${pathLength} steps`);
  
  // Convert to wall list format for output
  const walls_list = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 1) {
        walls_list.push([y + 1, x + 1]); // Convert to 1-indexed
      }
    }
  }
  
  return {
    width: width,
    height: height,
    start: [start[0] + 1, start[1] + 1], // Convert to 1-indexed
    end: [end[0] + 1, end[1] + 1], // Convert to 1-indexed
    walls: walls_list
  };
}

/**
 * Create a basic maze structure
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function createBaseMaze(grid, width, height) {
  // Create a simpler perfect maze using randomized DFS
  
  // Start with all walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x] = 1;
    }
  }
  
  // Directions: up, right, down, left
  const directions = [[-2, 0], [0, 2], [2, 0], [0, -2]];
  
  // Track visited cells
  const visited = Array(height).fill().map(() => Array(width).fill(false));
  
  // Start from a random position
  const startY = 1 + 2 * Math.floor(Math.random() * Math.floor((height - 1) / 2));
  const startX = 1 + 2 * Math.floor(Math.random() * Math.floor((width - 1) / 2));
  
  // Stack for DFS
  const stack = [[startY, startX]];
  visited[startY][startX] = true;
  grid[startY][startX] = 0;
  
  // DFS to carve passages
  while (stack.length > 0) {
    const [y, x] = stack[stack.length - 1];
    
    // Shuffle directions
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
    
    // Try to find a valid neighbor
    let found = false;
    
    for (const [dy, dx] of shuffledDirs) {
      const ny = y + dy;
      const nx = x + dx;
      
      // Check if in bounds and not visited
      if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1 && !visited[ny][nx]) {
        // Carve passage
        grid[y + dy/2][x + dx/2] = 0;
        grid[ny][nx] = 0;
        
        // Mark as visited and add to stack
        visited[ny][nx] = true;
        stack.push([ny, nx]);
        
        found = true;
        break;
      }
    }
    
    // If no valid neighbor found, backtrack
    if (!found) {
      stack.pop();
    }
  }
  
  // Open up the maze a bit by removing some random walls
  const numWallsToRemove = Math.floor(width * height * 0.05);
  for (let i = 0; i < numWallsToRemove; i++) {
    const y = 1 + Math.floor(Math.random() * (height - 2));
    const x = 1 + Math.floor(Math.random() * (width - 2));
    grid[y][x] = 0;
  }
}

/**
 * Place start and end points strategically
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {Object} The start and end positions
 */
function placeStartEnd(grid, width, height) {
  // Find all open cells
  const openCells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0) {
        openCells.push([y, x]);
      }
    }
  }
  
  // Try to place start and end points to maximize path length
  let bestStart = null;
  let bestEnd = null;
  let maxDistance = 0;
  
  // Try several random pairs to find the most distant
  const numAttempts = Math.min(50, openCells.length / 10);
  for (let i = 0; i < numAttempts; i++) {
    const startIdx = Math.floor(Math.random() * openCells.length);
    const endIdx = Math.floor(Math.random() * openCells.length);
    
    if (startIdx === endIdx) continue;
    
    const start = openCells[startIdx];
    const end = openCells[endIdx];
    
    // Calculate actual path distance
    const distance = calculatePathLength(grid, start, end);
    
    if (distance > maxDistance) {
      maxDistance = distance;
      bestStart = start;
      bestEnd = end;
    }
  }
  
  // If we couldn't find a good pair, use corners
  if (!bestStart || !bestEnd) {
    // Find corners that are open
    const corners = [
      [1, 1],                    // top-left
      [1, width - 2],            // top-right
      [height - 2, 1],           // bottom-left
      [height - 2, width - 2]    // bottom-right
    ].filter(([y, x]) => grid[y][x] === 0);
    
    if (corners.length >= 2) {
      bestStart = corners[0];
      bestEnd = corners[corners.length - 1];
    } else {
      // Just pick two random open cells
      bestStart = openCells[Math.floor(Math.random() * openCells.length)];
      do {
        bestEnd = openCells[Math.floor(Math.random() * openCells.length)];
      } while (bestEnd[0] === bestStart[0] && bestEnd[1] === bestStart[1]);
    }
  }
  
  return { start: bestStart, end: bestEnd };
}

/**
 * Calculate the path length between two points
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} The path length or 0 if no path exists
 */
function calculatePathLength(grid, start, end) {
  const height = grid.length;
  const width = grid[0].length;
  
  // BFS to find shortest path
  const queue = [[start[0], start[1], 0]]; // [y, x, distance]
  const visited = new Set(`${start[0]},${start[1]}`);
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  while (queue.length > 0) {
    const [y, x, dist] = queue.shift();
    
    if (y === end[0] && x === end[1]) {
      return dist; // Found the end
    }
    
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      const key = `${ny},${nx}`;
      
      if (
        ny >= 0 && ny < height &&
        nx >= 0 && nx < width &&
        grid[ny][nx] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([ny, nx, dist + 1]);
      }
    }
  }
  
  return 0; // No path found
}

/**
 * Add deceptive paths that exploit A* heuristics
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {number} end - The ending position [y, x]
 * @returns {number} Number of deceptive paths added
 */
function addDeceptivePaths(grid, width, height, start, end) {
  let pathsAdded = 0;
  const numPaths = Math.min(20, Math.floor(Math.max(width, height) / 5));
  
  // Direction vectors
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  // Find direction to end
  const dirToEndY = Math.sign(end[0] - start[0]);
  const dirToEndX = Math.sign(end[1] - start[1]);
  
  // Create deceptive paths from random locations
  for (let i = 0; i < numPaths; i++) {
    // Choose a random open cell
    let x, y;
    let attempts = 0;
    
    do {
      y = Math.floor(Math.random() * height);
      x = Math.floor(Math.random() * width);
      attempts++;
    } while (grid[y][x] !== 0 && attempts < 100);
    
    if (attempts >= 100) continue; // Couldn't find a suitable cell
    
    // Create a path that initially moves toward the end
    let currentY = y;
    let currentX = x;
    let length = 0;
    const maxLength = Math.floor(Math.min(width, height) / 4);
    
    // First create a path that heads toward the goal
    while (length < maxLength) {
      // Move preferentially toward the goal
      if (Math.random() < 0.7) {
        // Choose to move in Y or X direction toward goal
        if (Math.abs(end[0] - currentY) > Math.abs(end[1] - currentX)) {
          currentY += dirToEndY;
        } else {
          currentX += dirToEndX;
        }
      } else {
        // Random orthogonal direction
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        currentY += randomDir[0];
        currentX += randomDir[1];
      }
      
      // Check if we're still in bounds
      if (currentY < 0 || currentY >= height || currentX < 0 || currentX >= width) {
        break;
      }
      
      // Carve passage
      grid[currentY][currentX] = 0;
      length++;
    }
    
    // Now create a dead end by placing walls
    for (const [dy, dx] of directions) {
      const ny = currentY + dy;
      const nx = currentX + dx;
      
      if (ny >= 0 && ny < height && nx >= 0 && nx < width && 
          !(ny === end[0] && nx === end[1]) && // Don't block the end
          !(ny === start[0] && nx === start[1])) { // Don't block the start
        
        // Place wall with a chance
        if (Math.random() < 0.7) {
          grid[ny][nx] = 1;
        }
      }
    }
    
    pathsAdded++;
  }
  
  return pathsAdded;
}

/**
 * Add memory-intensive regions to the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {number} Number of memory-intensive regions added
 */
function addMemoryIntensiveRegions(grid, width, height) {
  let regionsAdded = 0;
  const numRegions = Math.min(5, Math.floor(Math.min(width, height) / 20));
  
  for (let i = 0; i < numRegions; i++) {
    // Find a suitable location
    let centerY, centerX;
    let attempts = 0;
    
    do {
      centerY = Math.floor(Math.random() * height);
      centerX = Math.floor(Math.random() * width);
      attempts++;
    } while (grid[centerY][centerX] !== 0 && attempts < 100);
    
    if (attempts >= 100) continue;
    
    // Create a grid-like structure with many connections
    const regionSize = Math.floor(Math.min(width, height) / 10);
    
    for (let y = Math.max(1, centerY - regionSize); y <= Math.min(height - 2, centerY + regionSize); y++) {
      for (let x = Math.max(1, centerX - regionSize); x <= Math.min(width - 2, centerX + regionSize); x++) {
        // Create a grid pattern with some randomness
        if (Math.random() < 0.6) {
          grid[y][x] = 0;
        }
      }
    }
    
    regionsAdded++;
  }
  
  return regionsAdded;
}

/**
 * Add strategic loops to the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {number} Number of loops added
 */
function addStrategicLoops(grid, width, height) {
  let loopsAdded = 0;
  const numLoops = Math.min(30, Math.floor(width * height * 0.01));
  
  for (let i = 0; i < numLoops; i++) {
    // Pick a random wall
    let y, x;
    let attempts = 0;
    
    do {
      y = 1 + Math.floor(Math.random() * (height - 2));
      x = 1 + Math.floor(Math.random() * (width - 2));
      attempts++;
    } while (grid[y][x] !== 1 && attempts < 100);
    
    if (attempts >= 100) continue;
    
    // Check if removing this wall would create a loop
    // (i.e., check if it has open passages on opposite sides)
    const hasNorthSouth = (y > 0 && y < height - 1 && 
                          grid[y-1][x] === 0 && grid[y+1][x] === 0);
    
    const hasEastWest = (x > 0 && x < width - 1 && 
                        grid[y][x-1] === 0 && grid[y][x+1] === 0);
    
    const hasDiagonal = (y > 0 && y < height - 1 && x > 0 && x < width - 1 &&
                        ((grid[y-1][x-1] === 0 && grid[y+1][x+1] === 0) ||
                         (grid[y-1][x+1] === 0 && grid[y+1][x-1] === 0)));
    
    if (hasNorthSouth || hasEastWest || hasDiagonal) {
      // Remove the wall to create a loop
      grid[y][x] = 0;
      loopsAdded++;
    }
  }
  
  return loopsAdded;
}

/**
 * Ensure there is a valid path from start to end
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} Length of the path
 */
function ensureValidPath(grid, width, height, start, end) {
  // Check if there is already a path
  const pathLength = calculatePathLength(grid, start, end);
  
  if (pathLength > 0) {
    return pathLength;
  }
  
  // No path exists, create one
  console.log("No valid path found, creating one...");
  
  // Create a direct path from start to end
  let currentY = start[0];
  let currentX = start[1];
  let steps = 0;
  
  while (currentY !== end[0] || currentX !== end[1]) {
    // Move towards the end
    if (Math.abs(currentY - end[0]) > Math.abs(currentX - end[1])) {
      currentY += Math.sign(end[0] - currentY);
    } else {
      currentX += Math.sign(end[1] - currentX);
    }
    
    // Ensure we're in bounds
    currentY = Math.max(0, Math.min(height - 1, currentY));
    currentX = Math.max(0, Math.min(width - 1, currentX));
    
    // Create passage
    grid[currentY][currentX] = 0;
    steps++;
    
    // Safety check
    if (steps > width * height) {
      break;
    }
  }
  
  return calculatePathLength(grid, start, end);
}

/**
 * Main function to generate a maze and save it to a file
 */
function main() {
  // Generate the maze
  const maze = generateAntiBotMaze(size, size);
  
  try {
    // Create directory if it doesn't exist
    const dir = outputFile.substring(0, outputFile.lastIndexOf('/'));
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the maze to file
    fs.writeFileSync(outputFile, JSON.stringify(maze, null, 2));
    console.log(`Anti-bot maze successfully generated and saved to ${outputFile}`);
    
    // Output key maze stats
    console.log(`Maze dimensions: ${maze.width}x${maze.height}`);
    console.log(`Start point: [${maze.start[0]}, ${maze.start[1]}]`);
    console.log(`End point: [${maze.end[0]}, ${maze.end[1]}]`);
    console.log(`Wall count: ${maze.walls.length}`);
    console.log(`Open cells: ${maze.width * maze.height - maze.walls.length}`);
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
    process.exit(1);
  }
}

main();

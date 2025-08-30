/**
 * Challenge Maze Generator
 * Creates the most challenging maze possible for a bot to solve
 * 
 * Usage: node challenge_maze_gen.js <outputFile> <size>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 3) {
  console.error('Usage: node challenge_maze_gen.js [outputFile] <size>');
  process.exit(1);
}

// Check if only size is provided
let outputFile, size;
if (process.argv.length === 3) {
  size = parseInt(process.argv[2]);
  outputFile = `mazes/challenge_maze_${size}.json`;
} else {
  outputFile = process.argv[2];
  size = parseInt(process.argv[3]);
}

// Validate size
if (isNaN(size) || size < 20) {
  console.error('Size must be a number greater than or equal to 20');
  process.exit(1);
}

/**
 * Generate an extremely challenging maze specifically designed to exploit weaknesses in pathfinding algorithms
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {Object} The generated maze object
 */
function generateChallengeMaze(width, height) {
  console.log(`Generating challenge maze with dimensions ${width}x${height}...`);
  
  // Initialize the grid: 1 = wall, 0 = passage
  const grid = Array(height).fill().map(() => Array(width).fill(1));
  
  // Create the basic maze structure using randomized Prim's algorithm
  createBaseMaze(grid, width, height);
  console.log("Basic maze structure created");
  
  // Add a large open area in the middle that will confuse A* heuristics
  addOpenArea(grid, width, height);
  console.log("Added central open area");
  
  // Choose strategic start and end points that maximize path length
  const { start, end } = placeStartEnd(grid, width, height);
  console.log(`Start: [${start[0]}, ${start[1]}], End: [${end[0]}, ${end[1]}]`);
  
  // Add extremely deceptive paths that exploit A* heuristics
  const deceptivePathsAdded = addDeceptivePaths(grid, width, height, start, end);
  console.log(`Added ${deceptivePathsAdded} deceptive paths`);
  
  // Add narrow winding passages that force long sequential movement
  addNarrowWindingPassages(grid, width, height);
  console.log("Added narrow winding passages");
  
  // Add memory-intensive regions (many branching paths)
  const memoryRegionsAdded = addMemoryIntensiveRegions(grid, width, height);
  console.log(`Added ${memoryRegionsAdded} memory-intensive regions`);
  
  // Add strategic loops to confuse the bot
  const loopsAdded = addStrategicLoops(grid, width, height);
  console.log(`Added ${loopsAdded} strategic loops`);
  
  // Add heuristic traps that exploit A* weaknesses
  addHeuristicTraps(grid, width, height, start, end);
  console.log("Added heuristic traps");
  
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
 * Create a basic maze structure using randomized Prim's algorithm
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function createBaseMaze(grid, width, height) {
  // Start with all walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x] = 1;
    }
  }
  
  // List of walls to consider
  const walls = [];
  
  // Start with a random cell
  const startY = 1 + 2 * Math.floor(Math.random() * Math.floor((height - 1) / 2));
  const startX = 1 + 2 * Math.floor(Math.random() * Math.floor((width - 1) / 2));
  
  // Mark the starting cell as a passage
  grid[startY][startX] = 0;
  
  // Add the walls of the starting cell to the wall list
  if (startY > 1) walls.push([startY - 1, startX, startY - 2, startX]);
  if (startY < height - 2) walls.push([startY + 1, startX, startY + 2, startX]);
  if (startX > 1) walls.push([startY, startX - 1, startY, startX - 2]);
  if (startX < width - 2) walls.push([startY, startX + 1, startY, startX + 2]);
  
  // Process walls until none remain
  while (walls.length > 0) {
    // Pick a random wall
    const wallIndex = Math.floor(Math.random() * walls.length);
    const [wallY, wallX, cellY, cellX] = walls[wallIndex];
    
    // Remove the wall from the list
    walls.splice(wallIndex, 1);
    
    // Only remove the wall if exactly one of the cells is a passage
    if (
      cellY >= 0 && cellY < height && cellX >= 0 && cellX < width && 
      ((grid[startY][startX] === 0 && grid[cellY][cellX] === 1) || 
       (grid[startY][startX] === 1 && grid[cellY][cellX] === 0))
    ) {
      // Make the wall and the cell passages
      grid[wallY][wallX] = 0;
      grid[cellY][cellX] = 0;
      
      // Add the walls of the new passage cell
      if (cellY > 1 && grid[cellY - 2][cellX] === 1) 
        walls.push([cellY - 1, cellX, cellY - 2, cellX]);
      if (cellY < height - 2 && grid[cellY + 2][cellX] === 1) 
        walls.push([cellY + 1, cellX, cellY + 2, cellX]);
      if (cellX > 1 && grid[cellY][cellX - 2] === 1) 
        walls.push([cellY, cellX - 1, cellY, cellX - 2]);
      if (cellX < width - 2 && grid[cellY][cellX + 2] === 1) 
        walls.push([cellY, cellX + 1, cellY, cellX + 2]);
    }
  }
  
  // Add random passages to create imperfect maze (has multiple paths)
  const numPassagesToAdd = Math.floor(width * height * 0.05);
  for (let i = 0; i < numPassagesToAdd; i++) {
    const y = 1 + Math.floor(Math.random() * (height - 2));
    const x = 1 + Math.floor(Math.random() * (width - 2));
    grid[y][x] = 0;
  }
}

/**
 * Add a large open area in the middle of the maze to confuse heuristics
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function addOpenArea(grid, width, height) {
  const centerY = Math.floor(height / 2);
  const centerX = Math.floor(width / 2);
  const radius = Math.floor(Math.min(width, height) * 0.15);
  
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      if (y >= 0 && y < height && x >= 0 && x < width) {
        // Create an open area
        if (Math.random() < 0.8) {
          grid[y][x] = 0;
        }
      }
    }
  }
  
  // Add some sparse walls in the open area to make navigation more complex
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      if (y >= 0 && y < height && x >= 0 && x < width && grid[y][x] === 0) {
        if (Math.random() < 0.15) {
          grid[y][x] = 1;
        }
      }
    }
  }
}

/**
 * Place start and end points to maximize path length
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
  
  if (openCells.length === 0) {
    // If no open cells, create some
    for (let i = 0; i < 10; i++) {
      const y = Math.floor(Math.random() * height);
      const x = Math.floor(Math.random() * width);
      grid[y][x] = 0;
      openCells.push([y, x]);
    }
  }
  
  // Try to place start and end points in opposite corners
  let bestStart = null;
  let bestEnd = null;
  let maxDistance = 0;
  
  // Try diagonal corners first
  const potentialCorners = [
    { start: [1, 1], end: [height - 2, width - 2] },
    { start: [1, width - 2], end: [height - 2, 1] },
    { start: [height - 2, 1], end: [1, width - 2] },
    { start: [height - 2, width - 2], end: [1, 1] }
  ];
  
  for (const { start, end } of potentialCorners) {
    // Find closest open cells to these corners
    let closestStart = findClosestOpenCell(grid, start[0], start[1], openCells);
    let closestEnd = findClosestOpenCell(grid, end[0], end[1], openCells);
    
    if (closestStart && closestEnd) {
      const distance = calculatePathLength(grid, closestStart, closestEnd);
      if (distance > maxDistance) {
        maxDistance = distance;
        bestStart = closestStart;
        bestEnd = closestEnd;
      }
    }
  }
  
  // If corner approach didn't work well, try random open cells
  if (maxDistance < width * height * 0.2) {
    const numAttempts = Math.min(50, openCells.length / 10);
    for (let i = 0; i < numAttempts; i++) {
      const startIdx = Math.floor(Math.random() * openCells.length);
      const endIdx = Math.floor(Math.random() * openCells.length);
      
      if (startIdx === endIdx) continue;
      
      const start = openCells[startIdx];
      const end = openCells[endIdx];
      
      const distance = calculatePathLength(grid, start, end);
      
      if (distance > maxDistance) {
        maxDistance = distance;
        bestStart = start;
        bestEnd = end;
      }
    }
  }
  
  // If still no good path, use the first two open cells
  if (!bestStart || !bestEnd) {
    if (openCells.length >= 2) {
      bestStart = openCells[0];
      bestEnd = openCells[openCells.length - 1];
    } else {
      // Emergency fallback - create start and end cells
      bestStart = [1, 1];
      bestEnd = [height - 2, width - 2];
      grid[bestStart[0]][bestStart[1]] = 0;
      grid[bestEnd[0]][bestEnd[1]] = 0;
    }
  }
  
  return { start: bestStart, end: bestEnd };
}

/**
 * Find the closest open cell to a given position
 * @param {Array} grid - The maze grid
 * @param {number} y - The y coordinate
 * @param {number} x - The x coordinate
 * @param {Array} openCells - List of open cells [y, x]
 * @returns {Array} The closest open cell [y, x]
 */
function findClosestOpenCell(grid, y, x, openCells) {
  let closest = null;
  let minDistance = Infinity;
  
  for (const [cellY, cellX] of openCells) {
    const dist = Math.sqrt(Math.pow(cellY - y, 2) + Math.pow(cellX - x, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closest = [cellY, cellX];
    }
  }
  
  return closest;
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
 * @param {Array} end - The ending position [y, x]
 * @returns {number} Number of deceptive paths added
 */
function addDeceptivePaths(grid, width, height, start, end) {
  let pathsAdded = 0;
  const numPaths = Math.min(30, Math.floor(Math.max(width, height) / 4));
  
  // Direction vectors
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  // Find direction to end from start
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
    const maxLength = Math.floor(Math.min(width, height) / 3);
    
    // First create a path that heads toward the goal
    while (length < maxLength) {
      // Move preferentially toward the goal
      if (Math.random() < 0.8) {
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
      
      // Create passage
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
        
        // Place wall with a high chance
        if (Math.random() < 0.8) {
          grid[ny][nx] = 1;
        }
      }
    }
    
    pathsAdded++;
  }
  
  return pathsAdded;
}

/**
 * Add narrow winding passages to the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function addNarrowWindingPassages(grid, width, height) {
  const numPassages = Math.min(10, Math.floor(Math.min(width, height) / 10));
  
  for (let i = 0; i < numPassages; i++) {
    // Pick a random start point for the passage
    let startY, startX;
    let attempts = 0;
    
    do {
      startY = Math.floor(Math.random() * height);
      startX = Math.floor(Math.random() * width);
      attempts++;
    } while (grid[startY][startX] !== 0 && attempts < 100);
    
    if (attempts >= 100) continue; // Couldn't find a suitable starting point
    
    // Create a winding passage
    let currentY = startY;
    let currentX = startX;
    let length = 0;
    const maxLength = Math.floor(Math.min(width, height) / 2);
    
    // Direction vectors
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    let lastDir = directions[Math.floor(Math.random() * directions.length)];
    
    while (length < maxLength) {
      // Choose a direction with bias towards continuing in the same direction
      let dir;
      if (Math.random() < 0.7) {
        // Continue in the same direction
        dir = lastDir;
      } else {
        // Change direction, but don't go backwards
        const availableDirs = directions.filter(d => 
          !(d[0] === -lastDir[0] && d[1] === -lastDir[1])
        );
        dir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
      }
      
      // Move in the chosen direction
      currentY += dir[0];
      currentX += dir[1];
      
      // Check if we're still in bounds
      if (currentY < 1 || currentY >= height - 1 || currentX < 1 || currentX >= width - 1) {
        break;
      }
      
      // Create passage
      grid[currentY][currentX] = 0;
      
      // Add walls on both sides of the passage to make it narrow
      const perpDir = [dir[1], -dir[0]]; // Perpendicular direction
      
      const sideY1 = currentY + perpDir[0];
      const sideX1 = currentX + perpDir[1];
      if (sideY1 >= 0 && sideY1 < height && sideX1 >= 0 && sideX1 < width) {
        grid[sideY1][sideX1] = 1;
      }
      
      const sideY2 = currentY - perpDir[0];
      const sideX2 = currentX - perpDir[1];
      if (sideY2 >= 0 && sideY2 < height && sideX2 >= 0 && sideX2 < width) {
        grid[sideY2][sideX2] = 1;
      }
      
      length++;
      lastDir = dir;
    }
  }
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
  const numRegions = Math.min(8, Math.floor(Math.min(width, height) / 15));
  
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
    
    // Create a region with many branching paths
    const regionSize = Math.floor(Math.min(width, height) / 8);
    
    for (let y = Math.max(1, centerY - regionSize); y <= Math.min(height - 2, centerY + regionSize); y++) {
      for (let x = Math.max(1, centerX - regionSize); x <= Math.min(width - 2, centerX + regionSize); x++) {
        // Create a complex pattern with many branches
        if (Math.random() < 0.7) {
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
  const numLoops = Math.min(50, Math.floor(width * height * 0.01));
  
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
 * Add heuristic traps to confuse A* algorithm
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 */
function addHeuristicTraps(grid, width, height, start, end) {
  const numTraps = Math.min(15, Math.floor(Math.min(width, height) / 10));
  
  // Calculate the direct path vector from start to end
  const directVectorY = end[0] - start[0];
  const directVectorX = end[1] - start[1];
  const distance = Math.sqrt(directVectorY * directVectorY + directVectorX * directVectorX);
  
  const normalizedVectorY = directVectorY / distance;
  const normalizedVectorX = directVectorX / distance;
  
  for (let i = 0; i < numTraps; i++) {
    // Place trap along the direct path
    const progress = 0.2 + (0.6 * i / numTraps); // Place traps between 20% and 80% of the way
    
    const trapY = Math.floor(start[0] + directVectorY * progress);
    const trapX = Math.floor(start[1] + directVectorX * progress);
    
    // Ensure we're in bounds
    if (trapY < 1 || trapY >= height - 1 || trapX < 1 || trapX >= width - 1) {
      continue;
    }
    
    // Find the closest open cell to the trap location
    let closestY = trapY;
    let closestX = trapX;
    let minDistance = Infinity;
    
    for (let y = Math.max(1, trapY - 5); y <= Math.min(height - 2, trapY + 5); y++) {
      for (let x = Math.max(1, trapX - 5); x <= Math.min(width - 2, trapX + 5); x++) {
        if (grid[y][x] === 0) {
          const dist = Math.sqrt(Math.pow(y - trapY, 2) + Math.pow(x - trapX, 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestY = y;
            closestX = x;
          }
        }
      }
    }
    
    // Create a trap at the closest open cell
    // The trap is a path that initially moves toward the end but then turns away
    
    // Clear a small area around the trap start
    for (let y = Math.max(1, closestY - 2); y <= Math.min(height - 2, closestY + 2); y++) {
      for (let x = Math.max(1, closestX - 2); x <= Math.min(width - 2, closestX + 2); x++) {
        if (Math.random() < 0.7) {
          grid[y][x] = 0;
        }
      }
    }
    
    // Create a path that initially moves toward end
    let currentY = closestY;
    let currentX = closestX;
    
    // First create a path that looks promising (toward the goal)
    for (let step = 0; step < 10; step++) {
      // Move in the direction of the end
      currentY += Math.round(normalizedVectorY);
      currentX += Math.round(normalizedVectorX);
      
      // Ensure we're in bounds
      if (currentY < 1 || currentY >= height - 1 || currentX < 1 || currentX >= width - 1) {
        break;
      }
      
      grid[currentY][currentX] = 0;
    }
    
    // Now create a diverging path that goes away from the goal
    for (let step = 0; step < 15; step++) {
      // Move perpendicular to the goal direction
      currentY += Math.round(-normalizedVectorX); // Perpendicular direction
      currentX += Math.round(normalizedVectorY);  // Perpendicular direction
      
      // Ensure we're in bounds
      if (currentY < 1 || currentY >= height - 1 || currentX < 1 || currentX >= width - 1) {
        break;
      }
      
      grid[currentY][currentX] = 0;
    }
    
    // Finally, create a dead end
    for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const ny = currentY + dy;
      const nx = currentX + dx;
      
      if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
        grid[ny][nx] = 1; // Create wall
      }
    }
  }
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
  const maze = generateChallengeMaze(size, size);
  
  try {
    // Create directory if it doesn't exist
    const dir = outputFile.substring(0, outputFile.lastIndexOf('/'));
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the maze to file
    fs.writeFileSync(outputFile, JSON.stringify(maze, null, 2));
    console.log(`Challenge maze successfully generated and saved to ${outputFile}`);
    
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

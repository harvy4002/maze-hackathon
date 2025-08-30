/**
 * Anti-Bot Maze Generator
 * Creates mazes specifically designed to challenge pathfinding algorithms by exploiting
 * common weaknesses in A* and BFS algorithms.
 * 
 * Usage: node anti_bot_maze_gen.js <outputFile> <size>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 3) {
  console.error('Usage: node anti_bot_maze_gen.js [outputFile] <size>');
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
  
  // Step 1: Create the basic structure with a perfect maze using DFS
  // (Perfect mazes have exactly one path between any two points)
  createPerfectMaze(grid, width, height);
  console.log("Basic maze structure created");
  
  // Step 2: Add start and end points that maximize search complexity
  const { start, end } = placeDeceptiveStartEnd(grid, width, height);
  console.log(`Start point placed at [${start[0]}, ${start[1]}]`);
  console.log(`End point placed at [${end[0]}, ${end[1]}]`);
  
  // Step 3: Add deceptive paths that exploit A* heuristics
  const deceptivePathsAdded = addDeceptivePaths(grid, width, height, start, end);
  console.log(`Added ${deceptivePathsAdded} deceptive paths that exploit A* heuristics`);
  
  // Step 4: Create heuristic traps that appear promising but lead nowhere
  const trapsAdded = addHeuristicTraps(grid, width, height, start, end);
  console.log(`Added ${trapsAdded} heuristic traps to misdirect the bot`);
  
  // Step 5: Add strategic loops to increase memory consumption
  const loopsAdded = addStrategicLoops(grid, width, height);
  console.log(`Added ${loopsAdded} strategic loops to increase memory usage`);
  
  // Step 6: Create narrow, winding passages to slow down the bot
  const narrowPassagesAdded = addNarrowWindingPassages(grid, width, height, start, end);
  console.log(`Added ${narrowPassagesAdded} narrow winding passages to slow the bot`);
  
  // Step 7: Ensure there is still a valid path from start to end
  const pathLength = ensureValidPath(grid, width, height, start, end);
  console.log(`Ensured valid path from start to end with length ${pathLength}`);
  
  // Step 8: Add memory-intensive regions
  const memoryRegionsAdded = addMemoryIntensiveRegions(grid, width, height);
  console.log(`Added ${memoryRegionsAdded} memory-intensive regions`);
  
  // Step 9: Verify connectivity one final time
  const { connected, actualPathLength } = verifyConnectivity(grid, width, height, start, end);
  if (!connected) {
    console.warn("WARNING: Maze is not fully connected. Fixing...");
    fixConnectivity(grid, width, height, start, end);
  }
  console.log(`Final path length from start to end: ${actualPathLength} steps`);
  
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
 * Create a perfect maze (exactly one path between any two points) using DFS
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function createPerfectMaze(grid, width, height) {
  // Mark all cells as unvisited
  const visited = Array(height).fill().map(() => Array(width).fill(false));
  
  // Start with a grid full of walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x] = 1;
    }
  }
  
  // Define the directions we can move (up, right, down, left)
  const directions = [
    [-2, 0], // up
    [0, 2],  // right
    [2, 0],  // down
    [0, -2]  // left
  ];
  
  // Function to check if a cell is valid and unvisited
  function isValidCell(y, x) {
    return y >= 0 && y < height && x >= 0 && x < width && !visited[y][x];
  }
  
  // Recursive function to carve passages
  function carvePassage(y, x) {
    visited[y][x] = true;
    grid[y][x] = 0; // Mark as passage
    
    // Shuffle directions randomly
    const shuffledDirections = [...directions];
    for (let i = shuffledDirections.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDirections[i], shuffledDirections[j]] = [shuffledDirections[j], shuffledDirections[i]];
    }
    
    // Try each direction
    for (const [dy, dx] of shuffledDirections) {
      const ny = y + dy;
      const nx = x + dx;
      
      if (isValidCell(ny, nx)) {
        // Carve passage between current cell and next cell
        grid[y + dy/2][x + dx/2] = 0;
        carvePassage(ny, nx);
      }
    }
  }
  
  // Start from a random cell (must be odd coordinates for cell positions)
  const startY = 1 + 2 * Math.floor(Math.random() * Math.floor((height - 1) / 2));
  const startX = 1 + 2 * Math.floor(Math.random() * Math.floor((width - 1) / 2));
  
  // Ensure we're working with odd dimensions for a proper maze
  const adjustedHeight = height % 2 === 0 ? height - 1 : height;
  const adjustedWidth = width % 2 === 0 ? width - 1 : width;
  
  // Initialize grid with all cells as walls
  for (let y = 0; y < adjustedHeight; y++) {
    for (let x = 0; x < adjustedWidth; x++) {
      if (y % 2 === 1 && x % 2 === 1) {
        // Mark all cells as unvisited
        visited[y][x] = false;
      } else {
        // Mark non-cell positions as visited to skip them
        visited[y][x] = true;
      }
    }
  }
  
  // Create the maze using DFS
  carvePassage(startY, startX);
  
  // Open the borders a bit to allow for more interesting paths
  openBorders(grid, width, height);
}

/**
 * Open a few strategic points along the borders
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function openBorders(grid, width, height) {
  // Number of border openings based on maze size
  const numOpenings = Math.max(4, Math.floor(Math.sqrt(Math.max(width, height))));
  
  for (let i = 0; i < numOpenings; i++) {
    // Randomly select a side
    const side = Math.floor(Math.random() * 4);
    
    switch(side) {
      case 0: // Top
        const topX = 1 + Math.floor(Math.random() * (width - 2));
        grid[0][topX] = 0;
        grid[1][topX] = 0;
        break;
      case 1: // Right
        const rightY = 1 + Math.floor(Math.random() * (height - 2));
        grid[rightY][width - 1] = 0;
        grid[rightY][width - 2] = 0;
        break;
      case 2: // Bottom
        const bottomX = 1 + Math.floor(Math.random() * (width - 2));
        grid[height - 1][bottomX] = 0;
        grid[height - 2][bottomX] = 0;
        break;
      case 3: // Left
        const leftY = 1 + Math.floor(Math.random() * (height - 2));
        grid[leftY][0] = 0;
        grid[leftY][1] = 0;
        break;
    }
  }
}

/**
 * Place start and end points to maximize search complexity
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {Object} The start and end coordinates
 */
function placeDeceptiveStartEnd(grid, width, height) {
  // We want to place start and end points that:
  // 1. Are far apart geometrically
  // 2. Have a much longer actual path between them than their Manhattan distance
  // 3. Force the bot to move away from the goal repeatedly
  
  // Find all open cells
  const openCells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0) {
        openCells.push([y, x]);
      }
    }
  }
  
  if (openCells.length < 2) {
    console.error("Not enough open cells to place start and end points");
    return {
      start: [1, 1],
      end: [height - 2, width - 2]
    };
  }
  
  // Try multiple random start points to find the best
  let bestStart = null;
  let bestEnd = null;
  let maxRatio = 0; // Ratio of actual path length to Manhattan distance
  
  const attempts = Math.min(50, Math.floor(openCells.length / 10));
  for (let i = 0; i < attempts; i++) {
    // Pick a random open cell as potential start
    const startIdx = Math.floor(Math.random() * openCells.length);
    const potentialStart = openCells[startIdx];
    
    // Find the cell with the longest path-to-Manhattan ratio
    let localBestEnd = null;
    let localMaxRatio = 0;
    
    // Try a subset of cells to find a good end point
    const samplesToCheck = Math.min(30, Math.floor(openCells.length / 5));
    const checked = new Set();
    
    for (let j = 0; j < samplesToCheck; j++) {
      // Ensure we don't check the same cell twice
      let endIdx;
      do {
        endIdx = Math.floor(Math.random() * openCells.length);
      } while (endIdx === startIdx || checked.has(endIdx));
      
      checked.add(endIdx);
      const potentialEnd = openCells[endIdx];
      
      // Calculate Manhattan distance
      const manhattanDist = Math.abs(potentialStart[0] - potentialEnd[0]) + 
                           Math.abs(potentialStart[1] - potentialEnd[1]);
      
      // Skip if they're too close
      if (manhattanDist < Math.max(width, height) / 3) continue;
      
      // Calculate actual path length
      const actualDist = calculateShortestPath(grid, potentialStart, potentialEnd);
      
      // Skip if no path exists
      if (actualDist === 0) continue;
      
      // Calculate ratio of actual to Manhattan distance
      const ratio = actualDist / manhattanDist;
      
      // Update if we found a better ratio
      if (ratio > localMaxRatio) {
        localMaxRatio = ratio;
        localBestEnd = potentialEnd;
      }
    }
    
    // Update best overall if this start point produced a better ratio
    if (localMaxRatio > maxRatio && localBestEnd) {
      maxRatio = localMaxRatio;
      bestStart = potentialStart;
      bestEnd = localBestEnd;
    }
  }
  
  // If we couldn't find a good pair, use corners
  if (!bestStart || !bestEnd) {
    console.log("Couldn't find an optimal start/end pair, using corners");
    
    // Find corners that are open
    let corners = [
      [1, 1],                    // top-left
      [1, width - 2],            // top-right
      [height - 2, 1],           // bottom-left
      [height - 2, width - 2]    // bottom-right
    ];
    
    // Filter to only open corners
    corners = corners.filter(([y, x]) => y >= 0 && y < height && x >= 0 && x < width && grid[y][x] === 0);
    
    if (corners.length >= 2) {
      // Use diagonally opposite corners if possible
      bestStart = corners[0];
      bestEnd = corners[corners.length - 1];
    } else {
      // Last resort - find any open cells
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === 0) {
            if (!bestStart) bestStart = [y, x];
            else if (!bestEnd) bestEnd = [y, x];
            
            if (bestStart && bestEnd) break;
          }
        }
        if (bestStart && bestEnd) break;
      }
    }
  }
  
  // If still couldn't find valid points, use defaults
  if (!bestStart || !bestEnd) {
    bestStart = [1, 1];
    bestEnd = [height - 2, width - 2];
    
    // Ensure these cells are open
    grid[bestStart[0]][bestStart[1]] = 0;
    grid[bestEnd[0]][bestEnd[1]] = 0;
  }
  
  console.log(`Start/End path length ratio: ${maxRatio.toFixed(2)} times the Manhattan distance`);
  
  return { 
    start: bestStart, 
    end: bestEnd
  };
}

/**
 * Calculate the shortest path length between two points
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} The path length or 0 if no path exists
 */
function calculateShortestPath(grid, start, end) {
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
  // For A* with Manhattan distance heuristic, create paths that:
  // 1. Initially move directly towards the goal
  // 2. Then hit a wall and require moving far away from the goal
  
  let pathsAdded = 0;
  const numDeceptivePaths = Math.floor(Math.sqrt(Math.max(width, height)));
  
  // Direction vectors
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  // Create deceptive paths from random points between start and end
  for (let i = 0; i < numDeceptivePaths; i++) {
    // Create a point somewhere between start and end
    const pointY = Math.floor(start[0] + (end[0] - start[0]) * (0.2 + Math.random() * 0.6));
    const pointX = Math.floor(start[1] + (end[1] - start[1]) * (0.2 + Math.random() * 0.6));
    
    // Skip if not a valid open cell
    if (pointY < 0 || pointY >= height || pointX < 0 || pointX >= width || grid[pointY][pointX] !== 0) {
      continue;
    }
    
    // Calculate direction towards end
    const dirToEndY = Math.sign(end[0] - pointY);
    const dirToEndX = Math.sign(end[1] - pointX);
    
    // Create a path that initially moves towards the end
    let currentY = pointY;
    let currentX = pointX;
    let pathLength = 0;
    const maxLength = Math.max(width, height) / 4;
    
    // First create a path that heads toward the goal
    while (pathLength < maxLength) {
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
      
      // Check if we're still in bounds and not hitting existing passages
      if (currentY < 0 || currentY >= height || currentX < 0 || currentX >= width) {
        break;
      }
      
      // Carve passage
      grid[currentY][currentX] = 0;
      pathLength++;
    }
    
    // Now create a dead end by placing a wall
    if (currentY >= 0 && currentY < height && currentX >= 0 && currentX < width) {
      // Place walls around the dead end
      for (const [dy, dx] of directions) {
        const ny = currentY + dy;
        const nx = currentX + dx;
        
        if (ny >= 0 && ny < height && nx >= 0 && nx < width && 
            !(ny === end[0] && nx === end[1]) && // Don't block the end
            !(ny === start[0] && nx === start[1])) { // Don't block the start
          grid[ny][nx] = 1; // Place wall
        }
      }
      
      // Leave one opening that forces going away from goal
      // Find the direction most away from the goal
      let maxDist = -1;
      let bestDir = null;
      
      for (const [dy, dx] of directions) {
        const ny = currentY + dy;
        const nx = currentX + dx;
        
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          // Calculate how much this direction takes us away from the goal
          const currentDist = Math.abs(end[0] - currentY) + Math.abs(end[1] - currentX);
          const newDist = Math.abs(end[0] - ny) + Math.abs(end[1] - nx);
          const distIncrease = newDist - currentDist;
          
          if (distIncrease > maxDist) {
            maxDist = distIncrease;
            bestDir = [dy, dx];
          }
        }
      }
      
      // Create the escape path leading away from goal
      if (bestDir) {
        let escapeY = currentY + bestDir[0];
        let escapeX = currentX + bestDir[1];
        
        if (escapeY >= 0 && escapeY < height && escapeX >= 0 && escapeX < width) {
          grid[escapeY][escapeX] = 0; // Open the escape path
          
          // Create a longer escape path that winds away from the goal
          for (let j = 0; j < maxLength * 1.5; j++) {
            // Move generally away from the goal with some randomness
            if (Math.random() < 0.7) {
              // Choose to move in Y or X direction away from goal
              if (Math.abs(end[0] - escapeY) < Math.abs(end[1] - escapeX)) {
                escapeY -= dirToEndY; // Move away in Y
              } else {
                escapeX -= dirToEndX; // Move away in X
              }
            } else {
              // Random orthogonal direction
              const randomDir = directions[Math.floor(Math.random() * directions.length)];
              escapeY += randomDir[0];
              escapeX += randomDir[1];
            }
            
            // Check if we're still in bounds
            if (escapeY < 0 || escapeY >= height || escapeX < 0 || escapeX >= width) {
              break;
            }
            
            // Carve passage
            grid[escapeY][escapeX] = 0;
          }
          
          // Finally, ensure this path connects back to the maze
          connectToMainMaze(grid, width, height, escapeY, escapeX);
          
          pathsAdded++;
        }
      }
    }
  }
  
  return pathsAdded;
}

/**
 * Connect a point to the main maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {number} y - The y-coordinate to connect
 * @param {number} x - The x-coordinate to connect
 */
function connectToMainMaze(grid, width, height, y, x) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  const visited = new Set(`${y},${x}`);
  const queue = [[y, x]];
  
  // BFS to find the shortest path to an existing passage
  while (queue.length > 0) {
    const [cy, cx] = queue.shift();
    
    // Check if we're adjacent to an open cell that we haven't visited
    for (const [dy, dx] of directions) {
      const ny = cy + dy;
      const nx = cx + dx;
      const key = `${ny},${nx}`;
      
      // Skip if out of bounds or already visited
      if (ny < 0 || ny >= height || nx < 0 || nx >= width || visited.has(key)) {
        continue;
      }
      
      // If we found an open cell that's not in our current path, we've connected
      if (grid[ny][nx] === 0 && !visited.has(`${ny},${nx}`)) {
        // Connect to it
        grid[cy][cx] = 0;
        return;
      }
      
      // Otherwise, add to queue to continue searching
      visited.add(key);
      queue.push([ny, nx]);
    }
  }
  
  // If we can't find a connection, create a direct one
  let cy = y;
  let cx = x;
  
  // Create a path to the center, ensuring we stay in bounds each step
  while (true) {
    // Check if current position is a valid passage
    if (cy >= 0 && cy < height && cx >= 0 && cx < width && 
        grid[cy][cx] === 0 && !visited.has(`${cy},${cx}`)) {
      break; // We've found an existing passage
    }
    
    // Move towards the center of the maze
    if (cy < height / 2) cy = Math.min(cy + 1, height - 1);
    else cy = Math.max(cy - 1, 0);
    
    if (cx < width / 2) cx = Math.min(cx + 1, width - 1);
    else cx = Math.max(cx - 1, 0);
    
    // Ensure we're in bounds
    cy = Math.max(0, Math.min(height - 1, cy));
    cx = Math.max(0, Math.min(width - 1, cx));
    
    // Carve passage
    if (cy >= 0 && cy < height && cx >= 0 && cx < width) {
      grid[cy][cx] = 0;
    }
    
    // Safety check to prevent infinite loops
    if (visited.has(`${cy},${cx}`)) {
      break;
    }
    visited.add(`${cy},${cx}`);
  }
}

/**
 * Add heuristic traps that appear promising but lead nowhere
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} Number of traps added
 */
function addHeuristicTraps(grid, width, height, start, end) {
  // Create paths that:
  // 1. Initially make progress toward the goal
  // 2. Then lead to a near-dead-end with many branches
  // This exploits A* preference for paths that appear to approach the goal
  
  let trapsAdded = 0;
  const numTraps = Math.max(5, Math.floor(Math.sqrt(Math.max(width, height)) * 1.5));
  
  // Direction vectors
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  // Find the general direction from start to end
  const dirToEndY = Math.sign(end[0] - start[0]);
  const dirToEndX = Math.sign(end[1] - start[1]);
  
  // Create traps at strategic points along the likely path
  for (let i = 0; i < numTraps; i++) {
    // Create a trap somewhere between start and end, biased toward places
    // where the bot will likely search based on A* heuristic
    let trapY, trapX;
    
    // 70% of traps on the direct path between start and end
    if (Math.random() < 0.7) {
      const ratio = 0.2 + Math.random() * 0.6; // 20-80% of the way from start to end
      trapY = Math.floor(start[0] + (end[0] - start[0]) * ratio);
      trapX = Math.floor(start[1] + (end[1] - start[1]) * ratio);
    } else {
      // Other traps in generally promising areas
      trapY = Math.floor(Math.random() * height);
      trapX = Math.floor(Math.random() * width);
    }
    
    // Skip if not a valid cell or too close to start/end
    if (trapY < 0 || trapY >= height || trapX < 0 || trapX >= width || 
        grid[trapY][trapX] !== 0 ||
        (Math.abs(trapY - start[0]) + Math.abs(trapX - start[1]) < width / 10) ||
        (Math.abs(trapY - end[0]) + Math.abs(trapX - end[1]) < width / 10)) {
      continue;
    }
    
    // Create a branching trap structure
    const trapSize = Math.floor(Math.min(width, height) / 10) + 
                    Math.floor(Math.random() * Math.min(width, height) / 10);
    
    // Build a network of dead-end passages that get closer to the goal
    // but ultimately don't connect
    let branchesCreated = 0;
    const maxBranches = 5 + Math.floor(Math.random() * 5); // 5-10 branches
    
    // Start by creating a "promising" entry corridor
    let currentY = trapY;
    let currentX = trapX;
    let entryLength = 0;
    const maxEntryLength = trapSize / 2;
    
    // Create entry corridor that heads toward the goal
    while (entryLength < maxEntryLength) {
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
      
      // Carve passage
      grid[currentY][currentX] = 0;
      entryLength++;
    }
    
    // Now create multiple branches that look promising but lead nowhere
    const trapCenterY = currentY;
    const trapCenterX = currentX;
    
    for (let branch = 0; branch < maxBranches; branch++) {
      // Start each branch from the trap center
      currentY = trapCenterY;
      currentX = trapCenterX;
      
      // Determine branch direction - favor directions toward the goal
      let branchDirY = 0;
      let branchDirX = 0;
      
      if (Math.random() < 0.7) {
        // Direction toward goal with slight variation
        branchDirY = dirToEndY + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.5 ? 1 : 0);
        branchDirX = dirToEndX + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.5 ? 1 : 0);
        
        // Normalize to ensure we're moving in a cardinal direction
        if (Math.abs(branchDirY) > Math.abs(branchDirX)) {
          branchDirY = Math.sign(branchDirY);
          branchDirX = 0;
        } else {
          branchDirY = 0;
          branchDirX = Math.sign(branchDirX);
        }
      } else {
        // Random direction
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        branchDirY = randomDir[0];
        branchDirX = randomDir[1];
      }
      
      // Create a branch that initially moves toward the goal
      let branchLength = 0;
      const maxBranchLength = trapSize + Math.floor(Math.random() * trapSize);
      
      while (branchLength < maxBranchLength) {
        // Move in branch direction with some randomness
        if (Math.random() < 0.8) {
          currentY += branchDirY;
          currentX += branchDirX;
        } else {
          // Small random variation
          if (branchDirY !== 0) {
            // Branch is vertical, add horizontal variation
            currentX += Math.random() < 0.5 ? -1 : 1;
          } else {
            // Branch is horizontal, add vertical variation
            currentY += Math.random() < 0.5 ? -1 : 1;
          }
        }
        
        // Check if we're still in bounds and not hitting existing passages
        if (currentY < 0 || currentY >= height || currentX < 0 || currentX >= width) {
          break;
        }
        
        // Create passage
        grid[currentY][currentX] = 0;
        branchLength++;
        
        // Occasionally create a sub-branch
        if (branchLength > 3 && Math.random() < 0.2) {
          createSubBranch(grid, width, height, currentY, currentX, Math.floor(trapSize / 2));
        }
      }
      
      branchesCreated++;
    }
    
    // Add a tiny chance (10%) that one branch actually connects to a valid path
    // This makes the trap even more deceptive as A* might need to explore all branches
    if (Math.random() < 0.1) {
      connectToMainMaze(grid, width, height, trapCenterY, trapCenterX);
    }
    
    if (branchesCreated > 0) {
      trapsAdded++;
    }
  }
  
  return trapsAdded;
}

/**
 * Create a sub-branch from a point
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {number} y - The y-coordinate to branch from
 * @param {number} x - The x-coordinate to branch from
 * @param {number} maxLength - Maximum length of the sub-branch
 */
function createSubBranch(grid, width, height, y, x, maxLength) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  // Pick a random direction
  const [dy, dx] = directions[Math.floor(Math.random() * directions.length)];
  
  let currentY = y;
  let currentX = x;
  let length = 0;
  
  while (length < maxLength) {
    currentY += dy;
    currentX += dx;
    
    // Check if we're still in bounds
    if (currentY < 0 || currentY >= height || currentX < 0 || currentX >= width) {
      break;
    }
    
    // Create passage
    grid[currentY][currentX] = 0;
    length++;
    
    // Add some randomness to the path
    if (Math.random() < 0.3) {
      // Pick a different direction
      const newDir = directions[Math.floor(Math.random() * directions.length)];
      if (newDir[0] !== -dy || newDir[1] !== -dx) { // Avoid going back
        currentY += newDir[0];
        currentX += newDir[1];
        
        // Check if we're still in bounds
        if (currentY >= 0 && currentY < height && currentX >= 0 && currentX < width) {
          grid[currentY][currentX] = 0;
          length++;
        }
      }
    }
  }
}

/**
 * Add strategic loops to increase memory consumption
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {number} Number of loops added
 */
function addStrategicLoops(grid, width, height) {
  // Strategic loops force the bot to consider many paths and increase memory usage
  
  let loopsAdded = 0;
  const numLoops = Math.max(10, Math.floor(Math.min(width, height) / 5));
  
  // Directions
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  for (let i = 0; i < numLoops; i++) {
    // Find a random passage cell
    let startY, startX;
    let attempts = 0;
    
    do {
      startY = Math.floor(Math.random() * height);
      startX = Math.floor(Math.random() * width);
      attempts++;
    } while ((grid[startY][startX] !== 0 || hasFewerThanTwoWalls(grid, height, width, startY, startX)) && 
             attempts < 100);
    
    if (attempts >= 100) continue; // Couldn't find a suitable cell
    
    // Create a loop by finding another passage nearby and connecting to it
    const loopRadius = Math.max(3, Math.floor(Math.min(width, height) / 15));
    
    // BFS to find a good cell to connect to
    const queue = [[startY, startX, 0]]; // [y, x, distance]
    const visited = new Set(`${startY},${startX}`);
    let loopEndY = -1;
    let loopEndX = -1;
    let loopDist = 0;
    
    while (queue.length > 0) {
      const [y, x, dist] = queue.shift();
      
      if (dist >= loopRadius) {
        // This cell is far enough away - if it's a passage and not directly
        // connected to our start, it's a good candidate for creating a loop
        if (grid[y][x] === 0 && !areDirectlyConnected(grid, startY, startX, y, x)) {
          loopEndY = y;
          loopEndX = x;
          loopDist = dist;
          break;
        }
      } else {
        // Continue searching
        for (const [dy, dx] of directions) {
          const ny = y + dy;
          const nx = x + dx;
          const key = `${ny},${nx}`;
          
          if (
            ny >= 0 && ny < height &&
            nx >= 0 && nx < width &&
            !visited.has(key)
          ) {
            visited.add(key);
            queue.push([ny, nx, dist + 1]);
          }
        }
      }
    }
    
    // If we found a suitable end point, create a passage to it
    if (loopEndY !== -1 && loopEndX !== -1) {
      // Create a winding path between the start and end points
      const path = createWindingPath(grid, width, height, startY, startX, loopEndY, loopEndX);
      
      if (path.length > 0) {
        // Carve the passage
        for (const [y, x] of path) {
          grid[y][x] = 0;
        }
        
        loopsAdded++;
      }
    }
  }
  
  return loopsAdded;
}

/**
 * Check if a cell has fewer than two walls around it
 * @param {Array} grid - The maze grid
 * @param {number} height - The height of the maze
 * @param {number} width - The width of the maze
 * @param {number} y - The y-coordinate
 * @param {number} x - The x-coordinate
 * @returns {boolean} True if the cell has fewer than two walls
 */
function hasFewerThanTwoWalls(grid, height, width, y, x) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  let wallCount = 0;
  
  for (const [dy, dx] of directions) {
    const ny = y + dy;
    const nx = x + dx;
    
    if (ny < 0 || ny >= height || nx < 0 || nx >= width || grid[ny][nx] === 1) {
      wallCount++;
    }
  }
  
  return wallCount < 2;
}

/**
 * Check if two points are directly connected
 * @param {Array} grid - The maze grid
 * @param {number} y1 - First point y-coordinate
 * @param {number} x1 - First point x-coordinate
 * @param {number} y2 - Second point y-coordinate
 * @param {number} x2 - Second point x-coordinate
 * @returns {boolean} True if the points are directly connected
 */
function areDirectlyConnected(grid, y1, x1, y2, x2) {
  // Check if the points are adjacent
  if (Math.abs(y1 - y2) + Math.abs(x1 - x2) === 1) {
    return true;
  }
  
  // Check if they're connected by a straight passage with no branches
  if (y1 === y2) {
    // Horizontal connection
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    
    for (let x = minX + 1; x < maxX; x++) {
      if (grid[y1][x] !== 0) {
        return false; // Blocked
      }
      
      // Check if this passage has branches
      if (
        (y1 > 0 && grid[y1 - 1][x] === 0) ||
        (y1 < grid.length - 1 && grid[y1 + 1][x] === 0)
      ) {
        return false; // Has a branch
      }
    }
    
    return true; // Direct horizontal connection
  } else if (x1 === x2) {
    // Vertical connection
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    for (let y = minY + 1; y < maxY; y++) {
      if (grid[y][x1] !== 0) {
        return false; // Blocked
      }
      
      // Check if this passage has branches
      if (
        (x1 > 0 && grid[y][x1 - 1] === 0) ||
        (x1 < grid[0].length - 1 && grid[y][x1 + 1] === 0)
      ) {
        return false; // Has a branch
      }
    }
    
    return true; // Direct vertical connection
  }
  
  return false; // Not directly connected
}

/**
 * Create a winding path between two points
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {number} startY - Starting y-coordinate
 * @param {number} startX - Starting x-coordinate
 * @param {number} endY - Ending y-coordinate
 * @param {number} endX - Ending x-coordinate
 * @returns {Array} List of points in the path
 */
function createWindingPath(grid, width, height, startY, startX, endY, endX) {
  const path = [];
  let currentY = startY;
  let currentX = startX;
  
  // Create a winding path with some randomness
  while (currentY !== endY || currentX !== endX) {
    // Choose whether to move in y or x direction
    if (Math.random() < 0.6) {
      // Move preferentially in the direction of the endpoint
      if (Math.abs(currentY - endY) > Math.abs(currentX - endX)) {
        // Move in y direction
        currentY += Math.sign(endY - currentY);
      } else {
        // Move in x direction
        currentX += Math.sign(endX - currentX);
      }
    } else {
      // Random move with some bias toward goal
      if (Math.random() < 0.7) {
        // Move toward goal
        if (Math.random() < 0.5 && currentY !== endY) {
          currentY += Math.sign(endY - currentY);
        } else if (currentX !== endX) {
          currentX += Math.sign(endX - currentX);
        } else {
          currentY += Math.sign(endY - currentY);
        }
      } else {
        // Random perpendicular move
        if (Math.abs(currentY - endY) > Math.abs(currentX - endX)) {
          // Moving primarily in y direction, make an x move
          currentX += Math.random() < 0.5 ? -1 : 1;
        } else {
          // Moving primarily in x direction, make a y move
          currentY += Math.random() < 0.5 ? -1 : 1;
        }
      }
    }
    
    // Ensure we stay in bounds
    currentY = Math.max(0, Math.min(height - 1, currentY));
    currentX = Math.max(0, Math.min(width - 1, currentX));
    
    // Add to path
    path.push([currentY, currentX]);
    
    // Limit path length to prevent infinite loops
    if (path.length > Math.max(width, height) * 2) {
      break;
    }
  }
  
  return path;
}

/**
 * Add narrow, winding passages to slow down the bot
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} Number of narrow passages added
 */
function addNarrowWindingPassages(grid, width, height, start, end) {
  // Create narrow, winding passages that force precise navigation
  // and slow down the bot as it needs to explore many options
  
  let passagesAdded = 0;
  const numPassages = Math.max(3, Math.floor(Math.min(width, height) / 10));
  
  // Areas to add narrow passages - focus on key areas that the bot will likely traverse
  const areas = [];
  
  // Area 1: Between start and end (middle section)
  areas.push({
    minY: Math.min(start[0], end[0]) + Math.floor(Math.abs(end[0] - start[0]) / 4),
    maxY: Math.max(start[0], end[0]) - Math.floor(Math.abs(end[0] - start[0]) / 4),
    minX: Math.min(start[1], end[1]) + Math.floor(Math.abs(end[1] - start[1]) / 4),
    maxX: Math.max(start[1], end[1]) - Math.floor(Math.abs(end[1] - start[1]) / 4)
  });
  
  // Area 2: Near the start
  areas.push({
    minY: Math.max(0, start[0] - Math.floor(height / 10)),
    maxY: Math.min(height - 1, start[0] + Math.floor(height / 10)),
    minX: Math.max(0, start[1] - Math.floor(width / 10)),
    maxX: Math.min(width - 1, start[1] + Math.floor(width / 10))
  });
  
  // Area 3: Near the end
  areas.push({
    minY: Math.max(0, end[0] - Math.floor(height / 10)),
    maxY: Math.min(height - 1, end[0] + Math.floor(height / 10)),
    minX: Math.max(0, end[1] - Math.floor(width / 10)),
    maxX: Math.min(width - 1, end[1] + Math.floor(width / 10))
  });
  
  // For each defined area, add narrow passages
  for (const area of areas) {
    for (let i = 0; i < numPassages; i++) {
      // Find a suitable starting point for the narrow passage
      const startY = area.minY + Math.floor(Math.random() * (area.maxY - area.minY + 1));
      const startX = area.minX + Math.floor(Math.random() * (area.maxX - area.minX + 1));
      
      if (grid[startY][startX] !== 0) continue; // Not an open cell
      
      // Create a narrow, winding passage
      const passageLength = Math.floor(Math.min(width, height) / 5) + 
                           Math.floor(Math.random() * Math.min(width, height) / 5);
      
      // Pick a random general direction
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
      let dirIdx = Math.floor(Math.random() * directions.length);
      
      // Create the passage
      let currentY = startY;
      let currentX = startX;
      let length = 0;
      
      while (length < passageLength) {
        // Get current direction
        let [dy, dx] = directions[dirIdx];
        
        // Move in current direction
        currentY += dy;
        currentX += dx;
        
        // Check if still in bounds
        if (currentY < 0 || currentY >= height || currentX < 0 || currentX >= width) {
          break;
        }
        
        // Create passage
        grid[currentY][currentX] = 0;
        length++;
        
        // Occasionally change direction to create a winding passage
        if (Math.random() < 0.3) {
          // Change to a perpendicular direction
          if (dy !== 0) {
            // Currently moving vertically, switch to horizontal
            dirIdx = 2 + Math.floor(Math.random() * 2); // left or right
          } else {
            // Currently moving horizontally, switch to vertical
            dirIdx = Math.floor(Math.random() * 2); // up or down
          }
        }
        
        // Create narrow "walls" on either side to force precise navigation
        if (Math.random() < 0.7) {
          // Find the perpendicular directions
          const perpDirs = [];
          if (dy !== 0) {
            perpDirs.push([0, -1]); // left
            perpDirs.push([0, 1]);  // right
          } else {
            perpDirs.push([-1, 0]); // up
            perpDirs.push([1, 0]);  // down
          }
          
          // Add walls on one or both sides
          for (const [py, px] of perpDirs) {
            if (Math.random() < 0.8) { // 80% chance to add a wall on each side
              const wallY = currentY + py;
              const wallX = currentX + px;
              
              if (wallY >= 0 && wallY < height && wallX >= 0 && wallX < width &&
                  !(wallY === start[0] && wallX === start[1]) && 
                  !(wallY === end[0] && wallX === end[1])) {
                grid[wallY][wallX] = 1; // Add wall
              }
            }
          }
        }
      }
      
      // Ensure the passage connects back to the main maze
      connectToMainMaze(grid, width, height, currentY, currentX);
      
      passagesAdded++;
    }
  }
  
  return passagesAdded;
}

/**
 * Add memory-intensive regions that force the bot to explore many paths
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {number} Number of memory-intensive regions added
 */
function addMemoryIntensiveRegions(grid, width, height) {
  // Create regions with high branching factor to consume memory
  // during BFS/A* search
  
  let regionsAdded = 0;
  const numRegions = Math.max(2, Math.floor(Math.min(width, height) / 20));
  
  for (let i = 0; i < numRegions; i++) {
    // Find a suitable location for the memory-intensive region
    const centerY = Math.floor(Math.random() * height);
    const centerX = Math.floor(Math.random() * width);
    
    if (grid[centerY][centerX] !== 0) continue; // Not an open cell
    
    // Create a region with high branching factor
    const regionRadius = Math.max(5, Math.floor(Math.min(width, height) / 15));
    
    // Add a dense network of interconnected passages
    for (let y = centerY - regionRadius; y <= centerY + regionRadius; y++) {
      for (let x = centerX - regionRadius; x <= centerX + regionRadius; x++) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        
        // Create a grid-like structure with some random variations
        if ((y - centerY) % 2 === 0 && (x - centerX) % 2 === 0) {
          grid[y][x] = 0; // Open cell
          
          // Connect to neighbors with some randomness
          const connectChance = 0.7; // 70% chance to connect each direction
          
          // Connect up
          if (y > 0 && Math.random() < connectChance) {
            grid[y - 1][x] = 0;
          }
          
          // Connect right
          if (x < width - 1 && Math.random() < connectChance) {
            grid[y][x + 1] = 0;
          }
          
          // Connect down
          if (y < height - 1 && Math.random() < connectChance) {
            grid[y + 1][x] = 0;
          }
          
          // Connect left
          if (x > 0 && Math.random() < connectChance) {
            grid[y][x - 1] = 0;
          }
        }
      }
    }
    
    // Add some diagonal connections to increase branching factor
    for (let y = centerY - regionRadius + 1; y < centerY + regionRadius; y++) {
      for (let x = centerX - regionRadius + 1; x < centerX + regionRadius; x++) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        
        if (grid[y][x] === 0 && Math.random() < 0.3) {
          // Add diagonal connections by creating 2x2 open areas
          if (y < height - 1 && x < width - 1) {
            grid[y][x + 1] = 0;
            grid[y + 1][x] = 0;
            grid[y + 1][x + 1] = 0;
          }
        }
      }
    }
    
    // Ensure the region is connected to the main maze
    connectToMainMaze(grid, width, height, centerY, centerX);
    
    regionsAdded++;
  }
  
  return regionsAdded;
}

/**
 * Ensure there is a valid path from start to end
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} Length of the path or 0 if no path exists
 */
function ensureValidPath(grid, width, height, start, end) {
  // Check if there is a path from start to end
  const pathLength = calculateShortestPath(grid, start, end);
  
  if (pathLength === 0) {
    console.log("No path from start to end, creating one...");
    
    // Create a path from start to end
    // We'll use a modified version of our winding path function
    const path = createWindingPath(grid, width, height, start[0], start[1], end[0], end[1]);
    
    // Carve the path
    for (const [y, x] of path) {
      grid[y][x] = 0;
    }
    
    return path.length;
  }
  
  return pathLength;
}

/**
 * Verify connectivity of the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {Object} Connectivity information
 */
function verifyConnectivity(grid, width, height, start, end) {
  // Check if there is a path from start to end
  const pathLength = calculateShortestPath(grid, start, end);
  
  return {
    connected: pathLength > 0,
    actualPathLength: pathLength
  };
}

/**
 * Fix connectivity issues in the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 */
function fixConnectivity(grid, width, height, start, end) {
  // Create a direct path from start to end
  let currentY = start[0];
  let currentX = start[1];
  
  while (currentY !== end[0] || currentX !== end[1]) {
    // Move preferentially towards the end
    if (Math.abs(currentY - end[0]) > Math.abs(currentX - end[1])) {
      currentY += Math.sign(end[0] - currentY);
    } else {
      currentX += Math.sign(end[1] - currentX);
    }
    
    // Carve passage
    grid[currentY][currentX] = 0;
  }
  
  console.log("Fixed connectivity by creating direct path");
}

/**
 * Main function to generate a maze and save it to a file
 */
function main() {
  console.log(`Generating anti-bot maze with size ${size}...`);
  
  // Generate the maze
  const maze = generateAntiBotMaze(size, size);
  
  try {
    // Ensure the directory exists
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
    
    // Warning about potential solver performance
    console.log("\nWARNING: This maze is specifically designed to challenge pathfinding algorithms.");
    console.log("It may cause some solvers to run slowly or use excessive memory.");
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
    process.exit(1);
  }
}

main();

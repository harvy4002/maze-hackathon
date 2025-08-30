/**
 * Maze Generator using Prim's Algorithm
 * Generates a random hedge maze using Prim's algorithm
 * 
 * Usage: node gen_prim_maze.js <outputFile> <size>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 3) {
  console.error('Usage: node gen_prim_maze.js [outputFile] <size>');
  process.exit(1);
}

// Check if only size is provided
let outputFile, size;
if (process.argv.length === 3) {
  size = parseInt(process.argv[2]);
  const sizeMultiple = Math.round(size / 10);
  outputFile = `mazes/maze${sizeMultiple}.json`;
} else {
  outputFile = process.argv[2];
  size = parseInt(process.argv[3]);
}

// Validate size
if (isNaN(size) || size < 5) {
  console.error('Size must be a number greater than or equal to 5');
  process.exit(1);
}

/**
 * Add walls adjacent to the cell to the list of walls to consider
 * @param {number} y - The y-coordinate of the cell
 * @param {number} x - The x-coordinate of the cell
 * @param {Array} walls - The list of walls to add to
 * @param {Array} grid - The maze grid
 * @param {number} height - The height of the maze
 * @param {number} width - The width of the maze
 */
function addWalls(y, x, walls, grid, height, width) {
  // Check all four directions
  const directions = [
    [-1, 0, 0], // North
    [0, 1, 1],  // East
    [1, 0, 2],  // South
    [0, -1, 3]  // West
  ];
  
  for (const [dy, dx, direction] of directions) {
    const ny = y + dy;
    const nx = x + dx;
    
    // Check if the neighboring cell is within bounds and is a wall
    if (
      ny > 0 && ny < height - 1 &&
      nx > 0 && nx < width - 1 &&
      grid[ny][nx] === 1
    ) {
      // Add the wall to the list
      walls.push([ny, nx, direction]);
    }
  }
}

/**
 * Add interior walls to create a more hedge-like structure
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function addInteriorWalls(grid, width, height) {
  // Adjust complexity factor for smaller mazes to ensure enough walls
  const sizeFactor = Math.min(1.0, 15 / Math.max(width, height));
  // Minimum probability to ensure even small mazes get enough walls
  const minProbability = 0.2;
  const wallProbability = Math.max(0.4 * sizeFactor, minProbability);
  
  // Add perpendicular branches to create a hedge-like structure
  // More thorough coverage: include both even and odd positions
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      // Skip if this is already a wall
      if (grid[y][x] === 1) continue;
      
      // Randomly add a wall here with adjusted probability
      if (Math.random() < wallProbability) {
        grid[y][x] = 1;
        
        // Add a branch in a random direction
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
          case 0: // Add branch to the north
            if (y > 1 && grid[y-1][x] === 0) grid[y-1][x] = 1;
            break;
          case 1: // Add branch to the east
            if (x < width - 2 && grid[y][x+1] === 0) grid[y][x+1] = 1;
            break;
          case 2: // Add branch to the south
            if (y < height - 2 && grid[y+1][x] === 0) grid[y+1][x] = 1;
            break;
          case 3: // Add branch to the west
            if (x > 1 && grid[y][x-1] === 0) grid[y][x-1] = 1;
            break;
        }
      }
    }
  }
  
  // Add some small "hedge islands" - isolated walls in the middle of passages
  const islandCount = Math.floor(width * height * 0.02 * sizeFactor);
  for (let i = 0; i < islandCount; i++) {
    // Pick a random position (not on the edge)
    const y = 2 + Math.floor(Math.random() * (height - 4));
    const x = 2 + Math.floor(Math.random() * (width - 4));
    
    // Only add islands in passages and if it won't block the only path
    if (grid[y][x] === 0) {
      // Count adjacent passages
      let passages = 0;
      if (grid[y - 1][x] === 0) passages++;
      if (grid[y + 1][x] === 0) passages++;
      if (grid[y][x - 1] === 0) passages++;
      if (grid[y][x + 1] === 0) passages++;
      
      // Only add an island if there are at least 3 adjacent passages
      if (passages >= 3) {
        grid[y][x] = 1;
      }
    }
  }
}

/**
 * Check and break horizontal runs of passages
 * @param {Array} grid - The maze grid
 * @param {number} row - The row to check
 * @param {number} width - The width of the maze
 * @param {number} maxRunLength - Maximum allowed run length
 */
function checkAndBreakHorizontalRun(grid, row, width, maxRunLength) {
  let runStart = -1;
  
  for (let x = 1; x < width - 1; x++) {
    if (grid[row][x] === 0) { // Passage
      if (runStart === -1) {
        runStart = x;
      } else if (x - runStart >= maxRunLength) {
        // Add a wall to break the run
        const breakPoint = Math.floor(runStart + (x - runStart) / 2);
        grid[row][breakPoint] = 1;
        
        // Add a passage going into the maze to maintain connectivity
        if (row < grid.length - 2) grid[row + 1][breakPoint] = 0;
        else if (row > 1) grid[row - 1][breakPoint] = 0;
        
        runStart = x; // Reset run start
      }
    } else { // Wall
      runStart = -1;
    }
  }
}

/**
 * Check and break vertical runs of passages
 * @param {Array} grid - The maze grid
 * @param {number} col - The column to check
 * @param {number} height - The height of the maze
 * @param {number} maxRunLength - Maximum allowed run length
 */
function checkAndBreakVerticalRun(grid, col, height, maxRunLength) {
  let runStart = -1;
  
  for (let y = 1; y < height - 1; y++) {
    if (grid[y][col] === 0) { // Passage
      if (runStart === -1) {
        runStart = y;
      } else if (y - runStart >= maxRunLength) {
        // Add a wall to break the run
        const breakPoint = Math.floor(runStart + (y - runStart) / 2);
        grid[breakPoint][col] = 1;
        
        // Add a passage going into the maze to maintain connectivity
        if (col < grid[0].length - 2) grid[breakPoint][col + 1] = 0;
        else if (col > 1) grid[breakPoint][col - 1] = 0;
        
        runStart = y; // Reset run start
      }
    } else { // Wall
      runStart = -1;
    }
  }
}

/**
 * Add hedge-like branches to create a more natural maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {number} branchCount - Number of branches to add
 */
function addHedgeBranches(grid, width, height, branchCount = Math.floor(width * height * 0.03)) {
  // Add some random branch points in the interior
  for (let i = 0; i < branchCount; i++) {
    // Pick a random interior position
    const y = 2 + Math.floor(Math.random() * (height - 4));
    const x = 2 + Math.floor(Math.random() * (width - 4));
    
    // Only add branches to passages
    if (grid[y][x] === 0) {
      // Check if we can add a branch (at least 2 adjacent walls)
      let adjacentWalls = 0;
      if (y > 0 && grid[y - 1][x] === 1) adjacentWalls++;
      if (y < height - 1 && grid[y + 1][x] === 1) adjacentWalls++;
      if (x > 0 && grid[y][x - 1] === 1) adjacentWalls++;
      if (x < width - 1 && grid[y][x + 1] === 1) adjacentWalls++;
      
      if (adjacentWalls >= 2) {
        // Create a small branch by adding a wall
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
          case 0: // North
            if (y > 2 && grid[y - 1][x] === 0) grid[y - 1][x] = 1;
            break;
          case 1: // East
            if (x < width - 3 && grid[y][x + 1] === 0) grid[y][x + 1] = 1;
            break;
          case 2: // South
            if (y < height - 3 && grid[y + 1][x] === 0) grid[y + 1][x] = 1;
            break;
          case 3: // West
            if (x > 2 && grid[y][x - 1] === 0) grid[y][x - 1] = 1;
            break;
        }
      }
    }
  }
}

/**
 * Break up long runs of paths along the edges of the maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function breakUpEdgeRuns(grid, width, height) {
  // Define what constitutes a "long run" based on maze size
  const maxRunLength = Math.max(3, Math.floor(Math.min(width, height) / 5));
  
  // Check for horizontal runs near the top edge (row 1)
  checkAndBreakHorizontalRun(grid, 1, width, maxRunLength);
  
  // Check for horizontal runs near the bottom edge (row height-2)
  checkAndBreakHorizontalRun(grid, height - 2, width, maxRunLength);
  
  // Check for vertical runs near the left edge (column 1)
  checkAndBreakVerticalRun(grid, 1, height, maxRunLength);
  
  // Check for vertical runs near the right edge (column width-2)
  checkAndBreakVerticalRun(grid, width - 2, height, maxRunLength);
  
  // Add some "hedge-like" features by creating branch points
  // Reduce complexity for larger mazes
  const sizeFactor = Math.min(1.0, 15 / Math.max(width, height));
  const branchCount = Math.floor(width * height * 0.03 * sizeFactor);
  addHedgeBranches(grid, width, height, branchCount);
}

/**
 * Add complexity to the maze by adding strategic dead ends, loops, and obstacles
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @param {Object} options - Optional configuration {start, end}
 */
function addMazeComplexity(grid, width, height, options = {}) {
  const { start, end } = options;
  
  // Calculate complexity factor with a higher minimum for more challenging mazes
  const baseSizeFactor = Math.min(1.0, 15 / Math.max(width, height));
  const sizeFactor = Math.max(baseSizeFactor, 0.4); // Minimum 0.4 complexity factor
  
  // Increase dead end count for more challenging mazes
  const deadEndCount = Math.floor(width * height * 0.08 * sizeFactor);
  console.log(`Adding ${deadEndCount} dead ends to increase maze complexity`);
  
  // Add some dead ends by adding walls
  for (let i = 0; i < deadEndCount; i++) {
    // Pick a random position (not on the edge)
    const y = 1 + Math.floor(Math.random() * (height - 2));
    const x = 1 + Math.floor(Math.random() * (width - 2));
    
    // Skip if this is the start or end point
    if (start && end && 
        ((y === start[0] && x === start[1]) || (y === end[0] && x === end[1]))) {
      continue;
    }
    
    // Only add walls if it's a passage and wouldn't completely block a path
    if (grid[y][x] === 0) {
      // Count adjacent passages
      let passages = 0;
      if (y > 0 && grid[y - 1][x] === 0) passages++;
      if (y < height - 1 && grid[y + 1][x] === 0) passages++;
      if (x > 0 && grid[y][x - 1] === 0) passages++;
      if (x < width - 1 && grid[y][x + 1] === 0) passages++;
      
      // Only add a wall if there are at least 3 adjacent passages
      // This ensures we're creating a dead end, not blocking the only path
      if (passages >= 3) {
        grid[y][x] = 1;
      }
    }
  }
  
  // Add strategic obstacles along potential direct paths between start and end
  if (start && end) {
    // Create a more challenging path by adding walls along the direct line
    // between start and end (with some randomness to avoid blocking all paths)
    const pathObstacleCount = Math.floor(Math.max(width, height) * 0.3);
    
    for (let i = 0; i < pathObstacleCount; i++) {
      // Interpolate between start and end with some random offset
      const ratio = Math.random();
      const offsetX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const offsetY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      
      const y = Math.floor(start[0] + ratio * (end[0] - start[0])) + offsetY;
      const x = Math.floor(start[1] + ratio * (end[1] - start[1])) + offsetX;
      
      // Ensure we're within bounds and not on start/end
      if (y > 0 && y < height - 1 && x > 0 && x < width - 1 &&
          !(y === start[0] && x === start[1]) && 
          !(y === end[0] && x === end[1]) && 
          grid[y][x] === 0) {
        
        // Check if adding this wall would maintain connectivity
        let passages = 0;
        if (grid[y - 1][x] === 0) passages++;
        if (grid[y + 1][x] === 0) passages++;
        if (grid[y][x - 1] === 0) passages++;
        if (grid[y][x + 1] === 0) passages++;
        
        // Only add wall if it won't block the only path
        if (passages >= 3) {
          grid[y][x] = 1;
        }
      }
    }
  }
  
  // Add some loops by removing walls (more strategically)
  // This creates alternative paths, making the maze more interesting
  const loopCount = Math.floor(width * height * 0.02 * sizeFactor);
  console.log(`Adding ${loopCount} loops for path diversity`);
  
  for (let i = 0; i < loopCount; i++) {
    // Pick a random position (not on the edge)
    const y = 1 + Math.floor(Math.random() * (height - 2));
    const x = 1 + Math.floor(Math.random() * (width - 2));
    
    // Only remove walls if it's a wall
    if (grid[y][x] === 1) {
      // Count adjacent passages
      let adjacentPassages = 0;
      if (y > 0 && grid[y - 1][x] === 0) adjacentPassages++;
      if (y < height - 1 && grid[y + 1][x] === 0) adjacentPassages++;
      if (x > 0 && grid[y][x - 1] === 0) adjacentPassages++;
      if (x < width - 1 && grid[y][x + 1] === 0) adjacentPassages++;
      
      // Only remove the wall if it would connect two passages
      if (adjacentPassages >= 2) {
        grid[y][x] = 0;
      }
    }
  }
  
  // Add more hedge islands to create obstacles
  const islandCount = Math.floor(width * height * 0.03 * sizeFactor);
  console.log(`Adding ${islandCount} hedge islands as obstacles`);
  
  for (let i = 0; i < islandCount; i++) {
    // Pick a random position (not on the edge)
    const y = 2 + Math.floor(Math.random() * (height - 4));
    const x = 2 + Math.floor(Math.random() * (width - 4));
    
    // Skip if this is the start or end point
    if (start && end && 
        ((y === start[0] && x === start[1]) || (y === end[0] && x === end[1]))) {
      continue;
    }
    
    // Only add islands in passages and if it won't block the only path
    if (grid[y][x] === 0) {
      // Count adjacent passages
      let passages = 0;
      if (grid[y - 1][x] === 0) passages++;
      if (grid[y + 1][x] === 0) passages++;
      if (grid[y][x - 1] === 0) passages++;
      if (grid[y][x + 1] === 0) passages++;
      
      // Only add an island if there are at least 3 adjacent passages
      if (passages >= 3) {
        grid[y][x] = 1;
        
        // Occasionally add an extended island (2x1 or 1x2)
        if (Math.random() < 0.3) {
          const direction = Math.floor(Math.random() * 4);
          const dy = [0, 1, 0, -1][direction];
          const dx = [1, 0, -1, 0][direction];
          
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1 && 
              grid[ny][nx] === 0 && 
              !(start && end && ((ny === start[0] && nx === start[1]) || (ny === end[0] && nx === end[1])))) {
            grid[ny][nx] = 1;
          }
        }
      }
    }
  }
  
  // Break up long runs along the edges
  breakUpEdgeRuns(grid, width, height);
}

/**
 * Find optimal start and end points for the maze using enhanced diameter search
 * @param {Array} grid - The maze grid
 * @param {number} height - The height of the maze
 * @param {number} width - The width of the maze
 * @returns {Object} The start and end points
 */
function findOptimalStartEndPair(grid, height, width) {
  // Find all open cells in the maze
  const openCells = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 0) {
        openCells.push([y, x]);
      }
    }
  }
  
  if (openCells.length < 2) {
    console.error("Not enough open cells to place start and end points");
    // Create some default entrance and exit points
    return {
      start: [1, 1],
      end: [height - 2, width - 2]
    };
  }
  
  // Helper function to find the furthest cell from a starting cell
  function findFurthestCell(startCell, cellList) {
    const distances = new Map();
    const queue = [[startCell[0], startCell[1], 0]]; // [y, x, distance]
    const visited = new Set(`${startCell[0]},${startCell[1]}`);
    
    // Perform BFS to calculate distances to all reachable cells
    while (queue.length > 0) {
      const [y, x, dist] = queue.shift();
      distances.set(`${y},${x}`, dist);
      
      // Check all four directions
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
    
    // Find the cell that's furthest away with weighted scoring
    let maxScore = 0;
    let furthestCell = null;
    
    for (const [y, x] of cellList) {
      // Skip the starting cell itself
      if (y === startCell[0] && x === startCell[1]) continue;
      
      const key = `${y},${x}`;
      const pathDist = distances.get(key) || 0;
      
      // Skip unreachable cells or cells with 0 distance
      if (pathDist === 0) continue;
      
      // Calculate physical distance (diagonal)
      const physicalDist = Math.sqrt(
        Math.pow(y - startCell[0], 2) + 
        Math.pow(x - startCell[1], 2)
      );
      
      // Penalize points that are in the same row or column (or close to it)
      const rowColumnPenalty = Math.min(
        Math.abs(y - startCell[0]),  // Row difference
        Math.abs(x - startCell[1])   // Column difference
      );
      
      // Add a significant penalty if the points are in a similar row or column
      // Higher penalty for being in the same row/column, less penalty for being close
      const alignmentPenalty = rowColumnPenalty <= 2 ? 15 - (rowColumnPenalty * 5) : 0;
      
      // Calculate a score that heavily weights path distance but also considers physical distance
      // Path distance is the primary factor (multiplied by 3)
      // Physical distance is a secondary factor to break ties and favor spread-out points
      // Subtract the alignment penalty to discourage same row/column placements
      const score = (pathDist * 3) + physicalDist - alignmentPenalty;
      
      if (score > maxScore) {
        maxScore = score;
        furthestCell = [y, x];
      }
    }
    
    return { 
      cell: furthestCell,
      distance: furthestCell ? distances.get(`${furthestCell[0]},${furthestCell[1]}`) : 0,
      score: maxScore
    };
  }
  
  // ENHANCED MULTI-PASS DIAMETER SEARCH ALGORITHM
  console.log("Using enhanced multi-pass diameter search algorithm");
  
  // Step 1: Identify strategic starting points from edges and corners
  const strategicPoints = [];
  
  // Add corner regions
  const cornerRegions = [
    // Top-left corner
    {minY: 1, maxY: Math.min(5, Math.floor(height * 0.2)), minX: 1, maxX: Math.min(5, Math.floor(width * 0.2))},
    // Top-right corner
    {minY: 1, maxY: Math.min(5, Math.floor(height * 0.2)), minX: Math.max(width - 6, width - Math.floor(width * 0.2) - 1), maxX: width - 2},
    // Bottom-left corner
    {minY: Math.max(height - 6, height - Math.floor(height * 0.2) - 1), maxY: height - 2, minX: 1, maxX: Math.min(5, Math.floor(width * 0.2))},
    // Bottom-right corner
    {minY: Math.max(height - 6, height - Math.floor(height * 0.2) - 1), maxY: height - 2, minX: Math.max(width - 6, width - Math.floor(width * 0.2) - 1), maxX: width - 2}
  ];
  
  // Add edge regions (middle of each edge)
  const edgeRegions = [
    // Top edge
    {minY: 1, maxY: Math.min(3, Math.floor(height * 0.1)), minX: Math.floor(width * 0.4), maxX: Math.floor(width * 0.6)},
    // Bottom edge
    {minY: Math.max(height - 4, height - Math.floor(height * 0.1) - 1), maxY: height - 2, minX: Math.floor(width * 0.4), maxX: Math.floor(width * 0.6)},
    // Left edge
    {minY: Math.floor(height * 0.4), maxY: Math.floor(height * 0.6), minX: 1, maxX: Math.min(3, Math.floor(width * 0.1))},
    // Right edge
    {minY: Math.floor(height * 0.4), maxY: Math.floor(height * 0.6), minX: Math.max(width - 4, width - Math.floor(width * 0.1) - 1), maxX: width - 2}
  ];
  
  // Collect open cells from each strategic region
  for (const region of [...cornerRegions, ...edgeRegions]) {
    for (let y = region.minY; y <= region.maxY; y++) {
      for (let x = region.minX; x <= region.maxX; x++) {
        if (y < height && x < width && grid[y][x] === 0) {
          strategicPoints.push([y, x]);
        }
      }
    }
  }
  
  // Add random interior points for diversity
  const interiorPoints = [];
  for (let i = 0; i < Math.min(30, Math.floor(openCells.length * 0.15)); i++) {
    const randomIndex = Math.floor(Math.random() * openCells.length);
    interiorPoints.push(openCells[randomIndex]);
  }
  
  // If we didn't find enough strategic points, use random points
  if (strategicPoints.length < 10) {
    console.log("Not enough strategic edge/corner points found, using random points");
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * openCells.length);
      strategicPoints.push(openCells[randomIndex]);
    }
  }
  
  // Combine all potential starting points
  const startingPoints = [...strategicPoints, ...interiorPoints];
  console.log(`Testing ${startingPoints.length} potential starting points`);
  
  // Step 2: Try multiple diameter searches and keep the best result
  let bestStart = null;
  let bestEnd = null;
  let maxPathLength = 0;
  
  // Set a minimum required path length based on maze size
  const minRequiredLength = Math.max(Math.floor(Math.max(height, width) * 0.7), 5);
  console.log(`Minimum required path length: ${minRequiredLength}`);
  
  // Set minimum required difference for half-size requirement
  const minRequiredDiff = Math.floor(Math.max(width, height) / 2);
  
  for (const startPoint of startingPoints) {
    // First pass: find furthest point from this starting point
    const pointAResult = findFurthestCell(startPoint, openCells);
    if (!pointAResult.cell) continue;
    
    // Second pass: find furthest point from point A
    const pointBResult = findFurthestCell(pointAResult.cell, openCells);
    if (!pointBResult.cell) continue;
    
    // Check if this pair meets the half-size separation requirement
    const rowDiff = Math.abs(pointAResult.cell[0] - pointBResult.cell[0]);
    const colDiff = Math.abs(pointAResult.cell[1] - pointBResult.cell[1]);
    // Both row AND column must meet the half-size requirement
    const hasRequiredSeparation = rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff;
    
    // Calculate a score that combines path length and separation
    const separationBonus = hasRequiredSeparation ? 100 : 0;
    const effectiveScore = pointBResult.distance + separationBonus;
    
    // Update best result if this pair has a higher score
    if (effectiveScore > maxPathLength) {
      maxPathLength = effectiveScore;
      bestStart = pointAResult.cell;
      bestEnd = pointBResult.cell;
      
      // Early exit if we found a very good path with required separation
      if (hasRequiredSeparation && pointBResult.distance >= minRequiredLength) {
        console.log(`Found optimal path (${pointBResult.distance} steps) with half-size separation, using it`);
        break;
      }
    }
  }
  
  // If we found a good path, use it
  if (bestStart && bestEnd) {
    // Check if the pair meets the half-size separation requirement
    const rowDiff = Math.abs(bestStart[0] - bestEnd[0]);
    const colDiff = Math.abs(bestStart[1] - bestEnd[1]);
    // Both row AND column must meet the half-size requirement
    const hasRequiredSeparation = rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff;
    
    const realDistance = findFurthestCell(bestStart, [bestEnd]).distance;
    
    if (hasRequiredSeparation && realDistance >= minRequiredLength) {
      console.log(`Found optimal start/end pair with path length of ${realDistance}`);
      console.log(`Start: [${bestStart[0]}, ${bestStart[1]}], End: [${bestEnd[0]}, ${bestEnd[1]}]`);
      console.log(`Row difference: ${rowDiff}, Column difference: ${colDiff}`);
      return {
        start: bestStart,
        end: bestEnd
      };
    } else if (realDistance >= minRequiredLength * 1.5) {
      // If the path is exceptionally long, we can use it even without meeting
      // the half-size requirement, but add a warning
      console.log(`Found very long path (${realDistance} steps), using it despite not meeting half-size requirement`);
      console.log(`Start: [${bestStart[0]}, ${bestStart[1]}], End: [${bestEnd[0]}, ${bestEnd[1]}]`);
      console.log(`Row difference: ${rowDiff}, Column difference: ${colDiff}`);
      console.log(`WARNING: This pair doesn't meet the half-size separation requirement`);
      return {
        start: bestStart,
        end: bestEnd
      };
    }
  }
  
  // If all else fails, try another approach: pick the furthest point from a random starting point
  console.log("Standard approach didn't find a long enough path, trying alternative approach");
  
  // Pick a random corner as a starting point
  const cornerIndices = [0, width-1, height*width-width, height*width-1];
  const possibleCorners = [];
  
  // Check each corner and nearby points for open cells
  for (let cornerY = 0; cornerY < 2; cornerY++) {
    for (let cornerX = 0; cornerX < 2; cornerX++) {
      // Calculate the region of this corner
      const regionMinY = cornerY === 0 ? 1 : Math.max(height - 6, height - Math.floor(height * 0.2) - 1);
      const regionMaxY = cornerY === 0 ? Math.min(6, Math.floor(height * 0.2)) : height - 2;
      const regionMinX = cornerX === 0 ? 1 : Math.max(width - 6, width - Math.floor(width * 0.2) - 1);
      const regionMaxX = cornerX === 0 ? Math.min(6, Math.floor(width * 0.2)) : width - 2;
      
      // Find open cells in this corner region
      for (let y = regionMinY; y <= regionMaxY; y++) {
        for (let x = regionMinX; x <= regionMaxX; x++) {
          if (y < height && x < width && grid[y][x] === 0) {
            possibleCorners.push([y, x]);
          }
        }
      }
    }
  }
  
  let start, end;
  
  if (possibleCorners.length >= 2) {
    // Pick two corners that are diagonally opposite if possible
    const idx1 = Math.floor(Math.random() * possibleCorners.length);
    let bestIdx2 = -1;
    let maxDiagonalScore = -1;
    
    // Find the corner point that's most diagonally opposite (not in same row or column)
    // Minimum required difference (half the size of the maze)
    const minRequiredDiff = Math.floor(Math.max(width, height) / 2);
    
    for (let i = 0; i < possibleCorners.length; i++) {
      if (i === idx1) continue;
      
      const [y1, x1] = possibleCorners[idx1];
      const [y2, x2] = possibleCorners[i];
      
      // Calculate physical distance
      const distance = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
      
      // Calculate row and column differences
      const rowDiff = Math.abs(y2 - y1);
      const colDiff = Math.abs(x2 - x1);
      const minDiff = Math.min(rowDiff, colDiff);
      
      // Check if at least one dimension has the required difference
      // Both row AND column must meet the half-size requirement
      const hasRequiredSeparation = rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff;
      
      // Heavy penalty for not meeting minimum separation requirement
      const separationPenalty = hasRequiredSeparation ? 0 : 200;
      
      // Additional penalty for being in similar row/column
      const alignmentPenalty = minDiff <= 2 ? 100 - (minDiff * 50) : 0;
      
      // Score favors distant points with at least half-maze separation in one dimension
      const score = distance * 2 - separationPenalty - alignmentPenalty;
      
      if (score > maxDiagonalScore) {
        maxDiagonalScore = score;
        bestIdx2 = i;
      }
    }
    
    start = possibleCorners[idx1];
    end = possibleCorners[bestIdx2 !== -1 ? bestIdx2 : (idx1 + Math.floor(possibleCorners.length/2)) % possibleCorners.length];
    
    // Check the actual path length between these corners
    const result = findFurthestCell(start, [end]);
    console.log(`Corner-to-corner path length: ${result.distance}`);
    console.log(`Row difference: ${Math.abs(start[0] - end[0])}, Column difference: ${Math.abs(start[1] - end[1])}`);
  } else {
    // Last resort: pick a suitable random cell pair ensuring they're well separated
    let attempts = 0;
    let bestStart = null;
    let bestEnd = null;
    let bestDistance = -1;
    let bestSeparationScore = -1;
    
    // Minimum required difference (half the size of the maze)
    const minRequiredDiff = Math.floor(Math.max(width, height) / 2);
    
    // Try multiple random starting points to find a good pair
    while (attempts < 15) {
      const randomCell = openCells[Math.floor(Math.random() * openCells.length)];
      const furthestResult = findFurthestCell(randomCell, openCells);
      
      if (furthestResult.cell) {
        const potentialEnd = furthestResult.cell;
        // Calculate row and column differences
        const rowDiff = Math.abs(randomCell[0] - potentialEnd[0]);
        const colDiff = Math.abs(randomCell[1] - potentialEnd[1]);
        const minDiff = Math.min(rowDiff, colDiff);
        
        // Check if at least one dimension has the required difference
        // Both row AND column must meet the half-size requirement
        const hasRequiredSeparation = rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff;
        
        // Score based on path length and separation
        const separationScore = hasRequiredSeparation ? 1000 : 0;
        const alignmentScore = minDiff * 10; // Reward for difference in both dimensions
        const score = furthestResult.distance + separationScore + alignmentScore;
        
        // Keep the best pair found so far, prioritizing those with required separation
        if ((hasRequiredSeparation && score > bestSeparationScore) || 
            (!hasRequiredSeparation && bestSeparationScore < 0 && score > bestDistance)) {
          bestStart = randomCell;
          bestEnd = potentialEnd;
          bestDistance = furthestResult.distance;
          bestSeparationScore = hasRequiredSeparation ? score : -1;
          
          // If we found a good pair with required separation, we can stop early
          if (hasRequiredSeparation && minDiff >= 3 && furthestResult.distance >= minRequiredDiff) {
            break;
          }
        }
      }
      attempts++;
    }
    
    if (bestStart && bestEnd) {
      start = bestStart;
      end = bestEnd;
      const rowDiff = Math.abs(start[0] - end[0]);
      const colDiff = Math.abs(start[1] - end[1]);
      console.log(`Random-to-furthest path length: ${bestDistance}`);
      console.log(`Row difference: ${rowDiff}, Column difference: ${colDiff}`);
      console.log(`At least half-maze separation: ${rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff}`);
      console.log(`Row separation: ${rowDiff >= minRequiredDiff ? "YES" : "NO"}, Column separation: ${colDiff >= minRequiredDiff ? "YES" : "NO"}`);
    } else {
      console.error("Failed to find any valid path, using default corners");
      // Absolute fallback - ensure they're at opposite sides of the maze
      // and maintain the half-size separation requirement
      const minRequiredDiff = Math.floor(Math.max(width, height) / 2);
      
      // Position start and end to guarantee they're at least half the maze size apart
      start = [1, 1];
      end = [height-2, width-2];
      
      // Check if this placement meets our half-size requirement
      const rowDiff = Math.abs(start[0] - end[0]);
      const colDiff = Math.abs(start[1] - end[1]);
      // Both row AND column must meet the half-size requirement
      const hasRequiredSeparation = rowDiff >= minRequiredDiff && colDiff >= minRequiredDiff;
      
      // If not, adjust the end position to ensure half-size separation in BOTH dimensions
      if (!hasRequiredSeparation) {
        // Ensure both row and column meet the requirement
        end = [Math.max(height-2, 1 + minRequiredDiff), Math.max(width-2, 1 + minRequiredDiff)];
      }
      
      console.log(`Fallback positions - Start: [${start[0]}, ${start[1]}], End: [${end[0]}, ${end[1]}]`);
      console.log(`Row difference: ${Math.abs(start[0] - end[0])}, Column difference: ${Math.abs(start[1] - end[1])}`);
    }
  }
  
  console.log(`Final start: [${start[0]}, ${start[1]}], end: [${end[0]}, ${end[1]}]`);
  return { start, end };
}

/**
 * This is a more aggressive function to ensure ALL cells are accessible
 * It will flood fill from the start and connect any isolated areas
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @returns {number} - Number of connections made
 */
function ensureFullConnectivity(grid, start) {
  const height = grid.length;
  const width = grid[0].length;
  
  // Step 1: First, find all open cells in the maze
  const openCells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0) {
        openCells.push([y, x]);
      }
    }
  }
  
  // Step 2: Flood fill from start to identify which cells are reachable
  const reachable = new Set([`${start[0]},${start[1]}`]);
  const queue = [start];
  
  while (queue.length > 0) {
    const [y, x] = queue.shift();
    
    // Check neighbors in all four directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      const key = `${ny},${nx}`;
      
      if (
        ny >= 0 && ny < height &&
        nx >= 0 && nx < width &&
        grid[ny][nx] === 0 &&
        !reachable.has(key)
      ) {
        reachable.add(key);
        queue.push([ny, nx]);
      }
    }
  }
  
  // Step 3: Identify all isolated regions (connected components)
  const unreachableCells = openCells.filter(([y, x]) => !reachable.has(`${y},${x}`));
  
  if (unreachableCells.length === 0) {
    return 0; // No isolated regions, maze is fully connected
  }
  
  // Step 4: For each isolated region, connect it to the main maze
  let connectionsAdded = 0;
  
  // Group unreachable cells into connected regions
  const regions = [];
  const visitedIsolated = new Set();
  
  for (const cell of unreachableCells) {
    const [y, x] = cell;
    const key = `${y},${x}`;
    
    if (visitedIsolated.has(key)) continue;
    
    // Find all cells in this isolated region
    const regionCells = [];
    const regionQueue = [[y, x]];
    visitedIsolated.add(key);
    
    while (regionQueue.length > 0) {
      const [cy, cx] = regionQueue.shift();
      regionCells.push([cy, cx]);
      
      // Check neighbors
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dy, dx] of directions) {
        const ny = cy + dy;
        const nx = cx + dx;
        const nKey = `${ny},${nx}`;
        
        if (
          ny >= 0 && ny < height &&
          nx >= 0 && nx < width &&
          grid[ny][nx] === 0 &&
          !reachable.has(nKey) &&
          !visitedIsolated.has(nKey)
        ) {
          visitedIsolated.add(nKey);
          regionQueue.push([ny, nx]);
        }
      }
    }
    
    regions.push(regionCells);
  }
  
  // Connect each isolated region to the main maze
  for (const region of regions) {
    // Find the cell in this region that's closest to any reachable cell
    let minDistance = Infinity;
    let closestUnreachable = null;
    let closestReachable = null;
    
    for (const [uy, ux] of region) {
      for (const key of reachable) {
        const [ry, rx] = key.split(',').map(Number);
        const distance = Math.abs(uy - ry) + Math.abs(ux - rx);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestUnreachable = [uy, ux];
          closestReachable = [ry, rx];
        }
      }
    }
    
    // Create a path from the closest unreachable cell to the closest reachable cell
    if (closestUnreachable && closestReachable) {
      let [y, x] = closestUnreachable;
      const [targetY, targetX] = closestReachable;
      
      // Create a path that alternates between moving vertically and horizontally
      while (y !== targetY || x !== targetX) {
        // Decide whether to move in y or x direction to get closer
        if (Math.abs(y - targetY) > Math.abs(x - targetX)) {
          y += Math.sign(targetY - y);
        } else {
          x += Math.sign(targetX - x);
        }
        
        grid[y][x] = 0; // Carve a passage
        reachable.add(`${y},${x}`); // Mark as reachable
      }
      
      connectionsAdded++;
    }
  }
  
  // Verify connectivity one more time
  const finalReachable = new Set();
  const finalQueue = [start];
  finalReachable.add(`${start[0]},${start[1]}`);
  
  while (finalQueue.length > 0) {
    const [y, x] = finalQueue.shift();
    
    // Check neighbors in all four directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      const key = `${ny},${nx}`;
      
      if (
        ny >= 0 && ny < height &&
        nx >= 0 && nx < width &&
        grid[ny][nx] === 0 &&
        !finalReachable.has(key)
      ) {
        finalReachable.add(key);
        finalQueue.push([ny, nx]);
      }
    }
  }
  
  // Final check for any remaining unreachable cells
  const finalUnreachable = openCells.filter(([y, x]) => !finalReachable.has(`${y},${x}`));
  
  if (finalUnreachable.length > 0) {
    console.warn(`WARNING: After connecting regions, ${finalUnreachable.length} cells are still unreachable!`);
    
    // Brute force connect any remaining cells
    for (const [y, x] of finalUnreachable) {
      // Find closest reachable cell
      let minDistance = Infinity;
      let closestReachable = null;
      
      for (const key of finalReachable) {
        const [ry, rx] = key.split(',').map(Number);
        const distance = Math.abs(y - ry) + Math.abs(x - rx);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestReachable = [ry, rx];
        }
      }
      
      // Create direct path
      if (closestReachable) {
        let [cy, cx] = [y, x];
        const [targetY, targetX] = closestReachable;
        
        while (cy !== targetY || cx !== targetX) {
          if (Math.random() < 0.5 && cy !== targetY) {
            cy += Math.sign(targetY - cy);
          } else if (cx !== targetX) {
            cx += Math.sign(targetX - cx);
          } else {
            cy += Math.sign(targetY - cy);
          }
          
          grid[cy][cx] = 0; // Carve passage
        }
        
        connectionsAdded++;
      }
    }
  }
  
  return connectionsAdded;
}

/**
 * Generate a hedge maze using Prim's algorithm
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 * @returns {Object} The generated maze object
 */
function generateHedgeMaze(width, height) {
  // Ensure odd dimensions for a proper hedge maze
  if (width % 2 === 0) width++;
  if (height % 2 === 0) height++;

  // Initialize the grid: 1 = wall, 0 = passage
  let grid = Array(height).fill().map(() => Array(width).fill(1));
  
  // Create a list of potential walls to remove
  let walls = [];
  
  // Start with a random cell (must be odd coordinates for cell positions)
  const startY = Math.floor(Math.random() * Math.floor(height / 2)) * 2 + 1;
  const startX = Math.floor(Math.random() * Math.floor(width / 2)) * 2 + 1;
  
  // Mark the starting cell as passage
  grid[startY][startX] = 0;
  
  // Add the walls of the starting cell to the wall list
  if (startY > 1) walls.push([startY - 1, startX, startY - 2, startX]); // North
  if (startY < height - 2) walls.push([startY + 1, startX, startY + 2, startX]); // South
  if (startX > 1) walls.push([startY, startX - 1, startY, startX - 2]); // West
  if (startX < width - 2) walls.push([startY, startX + 1, startY, startX + 2]); // East
  
  // While there are walls in the list
  while (walls.length > 0) {
    // Pick a random wall from the list
    const randomIndex = Math.floor(Math.random() * walls.length);
    const [wallY, wallX, oppositeY, oppositeX] = walls.splice(randomIndex, 1)[0];
    
    // Check if the opposite cell is still a wall
    if (
      oppositeY >= 0 && oppositeY < height && 
      oppositeX >= 0 && oppositeX < width && 
      grid[oppositeY][oppositeX] === 1
    ) {
      // Carve a passage by setting the wall and opposite cell to 0
      grid[wallY][wallX] = 0;
      grid[oppositeY][oppositeX] = 0;
      
      // Add new walls to the list
      if (oppositeY > 1 && grid[oppositeY - 2][oppositeX] === 1) 
        walls.push([oppositeY - 1, oppositeX, oppositeY - 2, oppositeX]); // North
      if (oppositeY < height - 2 && grid[oppositeY + 2][oppositeX] === 1) 
        walls.push([oppositeY + 1, oppositeX, oppositeY + 2, oppositeX]); // South
      if (oppositeX > 1 && grid[oppositeY][oppositeX - 2] === 1) 
        walls.push([oppositeY, oppositeX - 1, oppositeY, oppositeX - 2]); // West
      if (oppositeX < width - 2 && grid[oppositeY][oppositeX + 2] === 1) 
        walls.push([oppositeY, oppositeX + 1, oppositeY, oppositeX + 2]); // East
    }
  }
  
  // Add interior walls to create a more hedge-like structure
  addInteriorWalls(grid, width, height);
  
  // Ensure the outer border is all walls
  for (let y = 0; y < height; y++) {
    grid[y][0] = 1;
    grid[y][width - 1] = 1;
  }
  for (let x = 0; x < width; x++) {
    grid[0][x] = 1;
    grid[height - 1][x] = 1;
  }
  
  // Find optimal start and end points with enhanced algorithm
  const { start: entrance, end: exit } = findOptimalStartEndPair(grid, height, width);
  
  // Add strategic complexity to the maze - pass start/end for targeted complexity
  addMazeComplexity(grid, width, height, { start: entrance, end: exit });
  
  // Break up any large open areas (2x2 squares)
  const initialOpenAreas = breakUpLargeOpenAreas(grid, width, height);
  if (initialOpenAreas > 0) {
    console.log(`Fixed ${initialOpenAreas} large open areas`);
  }
  
  // Before finalizing, verify that all open cells are accessible from both start and end
  const { connectionsAdded, openAreasFixed, secondPassConnections } = ensureAllCellsAccessible(grid, entrance, exit);
  
  // One final pass to ensure no large open areas remain
  const finalOpenAreas = breakUpLargeOpenAreas(grid, width, height);
  
  if (connectionsAdded > 0 || openAreasFixed > 0 || finalOpenAreas > 0 || secondPassConnections > 0) {
    console.log(`Connected ${connectionsAdded} isolated areas in first pass`);
    if (secondPassConnections > 0) {
      console.log(`Connected ${secondPassConnections} remaining isolated areas in second pass`);
    }
    console.log(`Fixed ${openAreasFixed + finalOpenAreas} large open areas`);
  }
  
  // Final verification of connectivity
  const connectivityInfo = verifyFullConnectivity(grid, entrance);
  console.log(`Connectivity check: ${connectivityInfo.connectivityStatus}`);
  if (connectivityInfo.unreachableCells > 0) {
    console.warn(`WARNING: The maze still has ${connectivityInfo.unreachableCells} unreachable cells. Using full connectivity fix...`);
    
    // Use our more aggressive connectivity function
    const connectionsFixed = ensureFullConnectivity(grid, entrance);
    if (connectionsFixed > 0) {
      console.log(`Fixed ${connectionsFixed} connectivity issues using aggressive method`);
      
      // Break up any new 2x2 open areas
      const additionalOpenAreas = breakUpLargeOpenAreas(grid, width, height);
      if (additionalOpenAreas > 0) {
        console.log(`Fixed ${additionalOpenAreas} more large open areas`);
      }
    }
  }
  
  // After ensuring connectivity, calculate and display the actual path length
  // This confirms our start/end placement is creating appropriately long paths
  const pathLength = calculateActualPathLength(grid, entrance, exit);
  console.log(`Final path length from start to end: ${pathLength} steps`);
  
  // Convert to wall list format
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
    start: [entrance[0] + 1, entrance[1] + 1], // Convert to 1-indexed
    end: [exit[0] + 1, exit[1] + 1], // Convert to 1-indexed
    walls: walls_list
  };
}

/**
 * Calculate the actual path length from start to end using BFS
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {number} The path length in steps (0 if no path exists)
 */
function calculateActualPathLength(grid, start, end) {
  const height = grid.length;
  const width = grid[0].length;
  
  const queue = [[start[0], start[1], 0]]; // [y, x, distance]
  const visited = new Set(`${start[0]},${start[1]}`);
  
  while (queue.length > 0) {
    const [y, x, dist] = queue.shift();
    
    if (y === end[0] && x === end[1]) {
      return dist;
    }
    
    // Check all four directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
 * Break up large open areas (2x2 or larger) to create a more authentic hedge maze
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function breakUpLargeOpenAreas(grid, width, height) {
  let openAreasFound = 0;
  
  // Find all 2x2 or larger open areas and add walls to break them up
  for (let y = 1; y < height - 2; y++) {
    for (let x = 1; x < width - 2; x++) {
      if (grid[y][x] === 0 && grid[y][x+1] === 0 && 
          grid[y+1][x] === 0 && grid[y+1][x+1] === 0) {
        // Found a 2x2 open area, add a wall to break it up
        const position = Math.floor(Math.random() * 4);
        if (position === 0) grid[y][x] = 1;
        else if (position === 1) grid[y][x+1] = 1;
        else if (position === 2) grid[y+1][x] = 1;
        else grid[y+1][x+1] = 1;
        
        openAreasFound++;
      }
    }
  }
  
  return openAreasFound;
}

/**
 * Verify that all open cells are connected to the start position
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @returns {Object} Information about connectivity
 */
function verifyFullConnectivity(grid, start) {
  const height = grid.length;
  const width = grid[0].length;
  
  // Count all open cells
  let totalOpenCells = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0) {
        totalOpenCells++;
      }
    }
  }
  
  // Find all unreachable open cells
  const unreachableCells = [];
  
  // BFS to count reachable cells
  const queue = [start];
  const visited = new Set(`${start[0]},${start[1]}`);
  
  while (queue.length > 0) {
    const [y, x] = queue.shift();
    
    // Check all four directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
        queue.push([ny, nx]);
      }
    }
  }
  
  // Find any unreachable cells
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0 && !visited.has(`${y},${x}`)) {
        unreachableCells.push([y, x]);
      }
    }
  }
  
  const reachableCells = visited.size;
  const isFullyConnected = unreachableCells.length === 0;
  
  return {
    connectivityStatus: isFullyConnected ? "FULLY CONNECTED" : "DISCONNECTED",
    totalOpenCells,
    reachableCells,
    unreachableCells: unreachableCells.length,
    unreachableCellList: unreachableCells
  };
}

/**
 * Ensure all open cells in the grid are accessible from both start and end
 * @param {Array} grid - The maze grid
 * @param {Array} start - The starting position [y, x]
 * @param {Array} end - The ending position [y, x]
 * @returns {Object} Information about changes made
 */
function ensureAllCellsAccessible(grid, start, end) {
  const height = grid.length;
  const width = grid[0].length;
  
  // First, identify all open cells
  const openCells = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 0) {
        openCells.push([y, x]);
      }
    }
  }
  
  // This function will check which cells are accessible from a given cell
  function getAccessibleCells(startPos) {
    const accessible = new Set();
    const queue = [startPos];
    const visited = new Set(`${startPos[0]},${startPos[1]}`);
    
    while (queue.length > 0) {
      const [y, x] = queue.shift();
      accessible.add(`${y},${x}`);
      
      // Check all four directions
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
          queue.push([ny, nx]);
        }
      }
    }
    
    return accessible;
  }
  
  // Get all cells accessible from start
  const accessibleFromStart = getAccessibleCells(start);
  
  // Find inaccessible cells and connect them
  let connectionsAdded = 0;
  
  // Process each cell to ensure it's accessible
  for (const [y, x] of openCells) {
    if (!accessibleFromStart.has(`${y},${x}`)) {
      // This cell is not accessible, we need to connect it
      
      // Find the nearest accessible cell
      let minDist = Infinity;
      let nearestAccessible = null;
      
      for (const key of accessibleFromStart) {
        const [ay, ax] = key.split(',').map(Number);
        const dist = Math.abs(ay - y) + Math.abs(ax - x);
        if (dist < minDist) {
          minDist = dist;
          nearestAccessible = [ay, ax];
        }
      }
      
      // Create a path to the nearest accessible cell
      if (nearestAccessible) {
        const [ay, ax] = nearestAccessible;
        
        // Create a direct path (alternating between y and x movements)
        let cy = y;
        let cx = x;
        
        while (cy !== ay || cx !== ax) {
          // Move in either the y or x direction, whichever has more distance to cover
          if (Math.abs(cy - ay) > Math.abs(cx - ax)) {
            cy += Math.sign(ay - cy);
          } else {
            cx += Math.sign(ax - cx);
          }
          
          grid[cy][cx] = 0; // Carve passage
          
          // Add this cell to the accessible set
          accessibleFromStart.add(`${cy},${cx}`);
        }
        
        // Mark the original cell as accessible now
        accessibleFromStart.add(`${y},${x}`);
        connectionsAdded++;
      }
    }
  }
  
  // After connecting all cells, do one more pass to verify
  const allCellsAccessible = getAccessibleCells(start);
  let secondPassConnections = 0;
  
  // Double-check that all open cells are accessible
  for (const [y, x] of openCells) {
    if (!allCellsAccessible.has(`${y},${x}`)) {
      console.log(`WARNING: Cell at (${y},${x}) is still inaccessible! Creating direct path to start.`);
      
      // Force a direct path to the start
      let cy = y;
      let cx = x;
      
      while (cy !== start[0] || cx !== start[1]) {
        if (Math.abs(cy - start[0]) > Math.abs(cx - start[1])) {
          cy += Math.sign(start[0] - cy);
        } else {
          cx += Math.sign(start[1] - cx);
        }
        
        grid[cy][cx] = 0; // Carve passage
      }
      
      secondPassConnections++;
    }
  }
  
  // Break up any 2x2 open areas that might have been created during path connection
  const openAreasFixed = breakUpLargeOpenAreas(grid, width, height);
  
  return { 
    connectionsAdded, 
    openAreasFixed,
    secondPassConnections
  };
}

/**
 * Check if a path exists from start to end in the maze
 * @param {Object} maze - The maze object
 * @returns {boolean} True if a path exists, false otherwise
 */
function pathExists(maze) {
  const { width, height, start, end, walls } = maze;
  
  // Create a grid representation
  const grid = Array(height).fill().map(() => Array(width).fill(0));
  
  // Mark walls
  for (const [row, col] of walls) {
    if (row >= 1 && row <= height && col >= 1 && col <= width) {
      grid[row - 1][col - 1] = 1;
    }
  }
  
  // Check if start or end is on a wall (invalid maze)
  const startRow = start[0] - 1;
  const startCol = start[1] - 1;
  const endRow = end[0] - 1;
  const endCol = end[1] - 1;
  
  if (
    startRow < 0 || startRow >= height || startCol < 0 || startCol >= width ||
    endRow < 0 || endRow >= height || endCol < 0 || endCol >= width ||
    grid[startRow][startCol] === 1 || grid[endRow][endCol] === 1
  ) {
    console.error("Invalid maze: start or end is outside the grid or on a wall");
    return false;
  }
  
  // BFS to find path
  const queue = [[startRow, startCol]];
  const visited = new Set(`${startRow},${startCol}`);
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  while (queue.length > 0) {
    const [row, col] = queue.shift();
    
    if (row === endRow && col === endCol) {
      return true; // Path found
    }
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = `${newRow},${newCol}`;
      
      if (
        newRow >= 0 && newRow < height &&
        newCol >= 0 && newCol < width &&
        grid[newRow][newCol] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([newRow, newCol]);
      }
    }
  }
  
  console.error("No path found from start to end");
  return false; // No path found
}

/**
 * Main function to generate a maze and save it to a file
 */
function main() {
  let maze;
  let attempts = 0;
  const maxAttempts = 20;
  
  // Determine the filename based on size (e.g., maze1 for size 10, maze2 for size 20)
  const sizeMultiple = Math.round(size / 10);
  const defaultFilename = `mazes/maze${sizeMultiple}.json`;
  
  // Use provided filename or default to size-based name
  const finalOutputFile = outputFile === defaultFilename ? outputFile : outputFile;
  
  console.log(`Generating maze with size ${size} as ${finalOutputFile}`);
  
  do {
    console.log(`Attempt ${attempts + 1} to generate a valid maze...`);
    maze = generateHedgeMaze(size, size);
    attempts++;
    
    // Create a grid representation for verification
    const grid = Array(maze.height).fill().map(() => Array(maze.width).fill(0));
    
    // Mark walls
    for (const [row, col] of maze.walls) {
      if (row >= 1 && row <= maze.height && col >= 1 && col <= maze.width) {
        grid[row - 1][col - 1] = 1;
      }
    }
    
    // Check connectivity
    const startY = maze.start[0] - 1;
    const startX = maze.start[1] - 1;
    const connectivityInfo = verifyFullConnectivity(grid, [startY, startX]);
    
    console.log(`Connectivity check: ${connectivityInfo.connectivityStatus}`);
    console.log(`Total open cells: ${connectivityInfo.totalOpenCells}, Reachable: ${connectivityInfo.reachableCells}`);
    
    if (connectivityInfo.unreachableCells > 0) {
      console.log(`WARNING: Found ${connectivityInfo.unreachableCells} unreachable cells, fixing...`);
      
      // Fix connectivity issues by running our accessibility checker
      const accessibilityInfo = ensureAllCellsAccessible(grid, [startY, startX], [maze.end[0] - 1, maze.end[1] - 1]);
      console.log(`Added ${accessibilityInfo.connectionsAdded} connections to inaccessible areas`);
      
      // Update maze walls based on the fixed grid
      maze.walls = [];
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          if (grid[y][x] === 1) {
            maze.walls.push([y + 1, x + 1]); // Convert to 1-indexed
          }
        }
      }
      
      // Verify the fix worked
      const finalCheck = verifyFullConnectivity(grid, [startY, startX]);
      console.log(`Final connectivity: ${finalCheck.connectivityStatus}`);
      
      if (finalCheck.unreachableCells > 0) {
        console.log(`ERROR: Still have ${finalCheck.unreachableCells} unreachable cells after fixing. Retrying...`);
        continue; // Try generating a new maze
      }
    }
    
    if (attempts >= maxAttempts) {
      console.error(`Failed to generate a valid maze after ${maxAttempts} attempts.`);
      process.exit(1);
    }
  } while (!pathExists(maze));
  
  try {
    fs.writeFileSync(finalOutputFile, JSON.stringify(maze, null, 2));
    console.log(`Hedge maze successfully generated and saved to ${finalOutputFile}`);
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
    process.exit(1);
  }
}

main();

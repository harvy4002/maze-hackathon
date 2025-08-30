/**
 * Maze Generator using Prim's Algorithm
 * Generates a random hedge maze using Prim's algorithm
 * 
 * Usage: node gen_prim_maze.js <outputFile> <size>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 4) {
  console.error('Usage: node gen_prim_maze.js <outputFile> <size>');
  process.exit(1);
}

const outputFile = process.argv[2];
const size = parseInt(process.argv[3]);

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
 * Add complexity to the maze by adding some dead ends and loops
 * @param {Array} grid - The maze grid
 * @param {number} width - The width of the maze
 * @param {number} height - The height of the maze
 */
function addMazeComplexity(grid, width, height) {
  // Reduce complexity factor for larger mazes
  const sizeFactor = Math.min(1.0, 15 / Math.max(width, height));
  
  // Add some dead ends by adding walls
  const deadEndCount = Math.floor(width * height * 0.05 * sizeFactor);
  for (let i = 0; i < deadEndCount; i++) {
    // Pick a random position (not on the edge)
    const y = 1 + Math.floor(Math.random() * (height - 2));
    const x = 1 + Math.floor(Math.random() * (width - 2));
    
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
  
  // Add some loops by removing walls
  const loopCount = Math.floor(width * height * 0.01 * sizeFactor);
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
  
  // Break up long runs along the edges
  breakUpEdgeRuns(grid, width, height);
}

/**
 * Find start and end points that maximize the path length
 * Ensures points are at least half the maze size apart
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
  function findFurthestCell(startCell) {
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
    
    // Find the cell that's furthest away, prioritizing cells that are also physically distant
    let maxScore = 0;
    let furthestCell = null;
    
    for (const [y, x] of openCells) {
      const key = `${y},${x}`;
      const pathDist = distances.get(key) || 0;
      if (pathDist === 0) continue; // Skip unreachable cells
      
      // Calculate physical (diagonal) distance as well to break ties
      const diagDist = Math.sqrt(
        Math.pow(y - startCell[0], 2) + 
        Math.pow(x - startCell[1], 2)
      );
      
      // Score is primarily based on path distance, but break ties with diagonal distance
      const score = pathDist * 1000 + diagDist;
      
      if (score > maxScore) {
        maxScore = score;
        furthestCell = [y, x];
      }
    }
    
    return { 
      cell: furthestCell, 
      distance: furthestCell ? distances.get(`${furthestCell[0]},${furthestCell[1]}`) : 0 
    };
  }
  
  // Generate strategic starting points from extreme corners and edges
  const strategicPoints = [];
  
  // Define small extreme corner regions
  const cornerRegions = [
    {minY: 1, maxY: Math.min(10, Math.floor(height * 0.1)), minX: 1, maxX: Math.min(10, Math.floor(width * 0.1))},
    {minY: 1, maxY: Math.min(10, Math.floor(height * 0.1)), minX: Math.max(width - 11, width - Math.floor(width * 0.1) - 1), maxX: width - 2},
    {minY: Math.max(height - 11, height - Math.floor(height * 0.1) - 1), maxY: height - 2, minX: 1, maxX: Math.min(10, Math.floor(width * 0.1))},
    {minY: Math.max(height - 11, height - Math.floor(height * 0.1) - 1), maxY: height - 2, minX: Math.max(width - 11, width - Math.floor(width * 0.1) - 1), maxX: width - 2}
  ];
  
  // Also add some points from the middle of each edge
  const edgeRegions = [
    {minY: 1, maxY: Math.min(10, Math.floor(height * 0.1)), minX: Math.floor(width * 0.45), maxX: Math.floor(width * 0.55)},
    {minY: Math.max(height - 11, height - Math.floor(height * 0.1) - 1), maxY: height - 2, minX: Math.floor(width * 0.45), maxX: Math.floor(width * 0.55)},
    {minY: Math.floor(height * 0.45), maxY: Math.floor(height * 0.55), minX: 1, maxX: Math.min(10, Math.floor(width * 0.1))},
    {minY: Math.floor(height * 0.45), maxY: Math.floor(height * 0.55), minX: Math.max(width - 11, width - Math.floor(width * 0.1) - 1), maxX: width - 2}
  ];
  
  // Combine corner and edge regions
  const allRegions = [...cornerRegions, ...edgeRegions];
  
  // Find open cells in each region
  for (const region of allRegions) {
    const regionCells = [];
    for (let y = region.minY; y <= region.maxY; y++) {
      for (let x = region.minX; x <= region.maxX; x++) {
        if (y < height && x < width && grid[y][x] === 0) {
          regionCells.push([y, x]);
        }
      }
    }
    
    // If we found open cells in this region, add some to our strategic points
    if (regionCells.length > 0) {
      // Add up to 5 random cells from this region
      for (let i = 0; i < Math.min(5, regionCells.length); i++) {
        const randomIndex = Math.floor(Math.random() * regionCells.length);
        strategicPoints.push(regionCells[randomIndex]);
        regionCells.splice(randomIndex, 1);
      }
    }
  }
  
  // Add a few random points from throughout the maze for diversity
  const randomPointCount = 10;
  const openCellsCopy = [...openCells];
  for (let i = 0; i < randomPointCount && openCellsCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * openCellsCopy.length);
    strategicPoints.push(openCellsCopy[randomIndex]);
    openCellsCopy.splice(randomIndex, 1);
  }
  
  console.log(`Testing ${strategicPoints.length} strategic points to find optimal start/end positions`);
  
  // Calculate minimum required distance (half the maze size)
  const minRequiredDistance = Math.max(Math.floor(height / 2), Math.floor(width / 2));
  console.log(`Minimum required path distance: ${minRequiredDistance}`);
  
  // For each strategic point, find the furthest cell
  let maxPathLength = 0;
  let bestStart = null;
  let bestEnd = null;
  
  for (const startPoint of strategicPoints) {
    const result = findFurthestCell(startPoint);
    
    // Only consider pairs that meet the minimum distance requirement
    if (result.distance >= minRequiredDistance && result.cell) {
      if (result.distance > maxPathLength) {
        maxPathLength = result.distance;
        bestStart = startPoint;
        bestEnd = result.cell;
      }
    }
  }
  
  // Use the pair with the longest path (if it meets minimum distance)
  if (bestStart && bestEnd) {
    console.log(`Found start/end pair with estimated path length of ${maxPathLength}`);
    return {
      start: bestStart,
      end: bestEnd
    };
  } else {
    // No pair met the minimum distance criteria, retry with more points
    console.log(`No pairs met the minimum distance of ${minRequiredDistance}, trying again with more points`);
    
    // Add more points to increase chances of finding a suitable pair
    const additionalPoints = [];
    // Add points from all over the maze
    for (let i = 0; i < Math.min(50, openCells.length / 4); i++) {
      if (openCellsCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * openCellsCopy.length);
      additionalPoints.push(openCellsCopy.splice(randomIndex, 1)[0]);
    }
    
    // Try with the additional points
    for (const startPoint of additionalPoints) {
      const result = findFurthestCell(startPoint);
      
      if (result.distance >= minRequiredDistance && result.cell) {
        if (result.distance > maxPathLength) {
          maxPathLength = result.distance;
          bestStart = startPoint;
          bestEnd = result.cell;
        }
      }
    }
    
    if (bestStart && bestEnd) {
      console.log(`Found start/end pair with estimated path length of ${maxPathLength} after expansion`);
      return {
        start: bestStart,
        end: bestEnd
      };
    } else {
      // After trying with expanded points, still couldn't meet the criteria
      // Fall back to using the best pair we found regardless of the distance
      let fallbackBestStart = null;
      let fallbackBestEnd = null;
      let fallbackMaxLength = 0;
      
      // Find the best overall pair ignoring the minimum distance
      for (const startPoint of [...strategicPoints, ...additionalPoints]) {
        const result = findFurthestCell(startPoint);
        if (result.distance > fallbackMaxLength && result.cell) {
          fallbackMaxLength = result.distance;
          fallbackBestStart = startPoint;
          fallbackBestEnd = result.cell;
        }
      }
      
      if (fallbackBestStart && fallbackBestEnd) {
        console.log(`Falling back to start/end pair with path length ${fallbackMaxLength} (below minimum)`);
        return {
          start: fallbackBestStart,
          end: fallbackBestEnd
        };
      }
      
      // If everything fails, just pick random points
      console.log("Using random start/end positions as last resort");
      const randomIndex1 = Math.floor(Math.random() * openCells.length);
      let randomIndex2 = Math.floor(Math.random() * openCells.length);
      
      // Try to ensure the random points are physically distant
      let bestRandomDist = 0;
      let bestRandomPair = [randomIndex1, randomIndex2];
      
      // Try several random pairs to find physically distant ones
      for (let i = 0; i < 20; i++) {
        const idx1 = Math.floor(Math.random() * openCells.length);
        const idx2 = Math.floor(Math.random() * openCells.length);
        
        if (idx1 !== idx2) {
          const cell1 = openCells[idx1];
          const cell2 = openCells[idx2];
          const physicalDist = Math.sqrt(
            Math.pow(cell1[0] - cell2[0], 2) + 
            Math.pow(cell1[1] - cell2[1], 2)
          );
          
          if (physicalDist > bestRandomDist) {
            bestRandomDist = physicalDist;
            bestRandomPair = [idx1, idx2];
          }
        }
      }
      
      return {
        start: openCells[bestRandomPair[0]],
        end: openCells[bestRandomPair[1]]
      };
    }
  }
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
  
  // Find optimal start and end points
  const { start: entrance, end: exit } = findOptimalStartEndPair(grid, height, width);
  
  // Add some complexity to the maze
  addMazeComplexity(grid, width, height);
  
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
    fs.writeFileSync(outputFile, JSON.stringify(maze, null, 2));
    console.log(`Hedge maze successfully generated and saved to ${outputFile}`);
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
    process.exit(1);
  }
}

main();

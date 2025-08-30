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

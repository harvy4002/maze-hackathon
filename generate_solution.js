/**
 * Solution Generator for Maze Runner Competition
 * 
 * This script demonstrates how to generate a properly formatted solution file
 * for the competition. It runs your algorithm on a maze and records the execution time.
 * 
 * Usage: node generate_solution.js <maze_file> <output_file> <team_name>
 * 
 * NOTE: Replace the solveMaze function with your own maze-solving algorithm.
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 5) {
  console.error('Usage: node generate_solution.js <maze_file> <output_file> <team_name>');
  process.exit(1);
}

const mazeFile = process.argv[2];
const outputFile = process.argv[3];
const teamName = process.argv[4];
// Algorithm name is now optional and not used in the solution file

/**
 * Generate a solution for a maze
 */
function generateSolution() {
  // Read the maze file
  let maze;
  try {
    const mazeData = fs.readFileSync(mazeFile, 'utf8');
    maze = JSON.parse(mazeData);
  } catch (err) {
    console.error(`Error reading maze file: ${err.message}`);
    process.exit(1);
  }

  // Read the solution template
  let templateSolution;
  try {
    const templatePath = './templates/solution_template.json';
    const templateData = fs.readFileSync(templatePath, 'utf8');
    templateSolution = JSON.parse(templateData);
  } catch (err) {
    console.error(`Error reading template file: ${err.message}`);
    console.log('Continuing with default solution structure...');
    templateSolution = { team: "", mazeName: "", path: [], executionTime: 0 };
  }

  console.log(`Solving maze: ${mazeFile}`);
  console.log(`Start: (r${maze.start[0]}c${maze.start[1]}), End: (r${maze.end[0]}c${maze.end[1]})`);
  
  // Solve the maze and time the execution
  console.log('Finding path...');
  const startTime = performance.now();
  const path = solveMaze(maze);
  const endTime = performance.now();
  const executionTime = (endTime - startTime).toFixed(2);
  
  console.log(`Solution found in ${executionTime}ms`);
  
  // Convert path to R1C1 notation
  const r1c1Path = convertToR1C1Notation(path);
  
  // Extract maze file name from the path
  const mazeFileName = mazeFile.split('/').pop();
  
  // Create the solution object using the template
  const solution = {
    ...templateSolution,
    team: teamName,
    mazeName: mazeFileName,
    path: r1c1Path,
    executionTime: parseFloat(executionTime)
  };
  
  // Write the solution to file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(solution, null, 2));
    console.log(`Solution saved to ${outputFile}`);
    
    // Also print the R1C1 notation path to console
    const r1c1String = `[${r1c1Path.join(',')}]`;
    console.log(`R1C1 Solution Path: ${r1c1String}`);
  } catch (err) {
    console.error(`Error writing solution file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Solve a maze
 * @param {Object} maze - The maze object
 * @returns {Array} Array of coordinates representing the path [row, col]
 */
function solveMaze(maze) {
  // ==========================================
  // REPLACE THIS WITH YOUR ALGORITHM
  // ==========================================
  
  // This is a placeholder algorithm using A* search
  // It's a basic implementation for demonstration purposes
  
  const { width, height, start, end, walls } = maze;
  
  // Convert walls to a set for faster lookup
  const wallsSet = new Set(walls.map(wall => `${wall[0]},${wall[1]}`));
  
  // A* search algorithm
  const openSet = [];
  const closedSet = new Set();
  const gScore = {}; // Cost from start to current
  const fScore = {}; // Estimated total cost (g + h)
  const cameFrom = {}; // Path tracking
  
  // Initialize starting point
  const startKey = `${start[0]},${start[1]}`;
  gScore[startKey] = 0;
  fScore[startKey] = manhattanDistance(start, end);
  openSet.push({
    position: start,
    key: startKey,
    f: fScore[startKey]
  });
  
  while (openSet.length > 0) {
    // Sort by f-score and take the lowest
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    // Check if we've reached the end
    if (current.position[0] === end[0] && current.position[1] === end[1]) {
      return reconstructPath(cameFrom, current.key, start);
    }
    
    // Mark as processed
    closedSet.add(current.key);
    
    // Check all neighbors
    const neighbors = getNeighbors(current.position, width, height, wallsSet);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor[0]},${neighbor[1]}`;
      
      // Skip if already processed
      if (closedSet.has(neighborKey)) continue;
      
      // Calculate g score for this path
      const tentativeGScore = gScore[current.key] + 1;
      
      // Check if this is a better path
      if (!gScore[neighborKey] || tentativeGScore < gScore[neighborKey]) {
        // Record this path
        cameFrom[neighborKey] = current.key;
        gScore[neighborKey] = tentativeGScore;
        fScore[neighborKey] = tentativeGScore + manhattanDistance(neighbor, end);
        
        // Add to open set if not already there
        const existingIndex = openSet.findIndex(item => item.key === neighborKey);
        if (existingIndex === -1) {
          openSet.push({
            position: neighbor,
            key: neighborKey,
            f: fScore[neighborKey]
          });
        } else {
          // Update existing entry
          openSet[existingIndex].f = fScore[neighborKey];
        }
      }
    }
  }
  
  // No path found
  console.error('No solution found!');
  return [];
}

/**
 * Get valid neighboring cells
 * @param {Array} position - Current position [row, col]
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 * @param {Set} wallsSet - Set of wall positions
 * @returns {Array} Array of valid neighbors
 */
function getNeighbors(position, width, height, wallsSet) {
  const [row, col] = position;
  const neighbors = [];
  
  // Check all four directions
  const directions = [
    [row - 1, col], // up
    [row + 1, col], // down
    [row, col - 1], // left
    [row, col + 1]  // right
  ];
  
  for (const [r, c] of directions) {
    // Check if in bounds
    if (r < 1 || r > height || c < 1 || c > width) continue;
    
    // Check if not a wall
    if (!wallsSet.has(`${r},${c}`)) {
      neighbors.push([r, c]);
    }
  }
  
  return neighbors;
}

/**
 * Calculate Manhattan distance between two points
 * @param {Array} point1 - First point [row, col]
 * @param {Array} point2 - Second point [row, col]
 * @returns {number} Manhattan distance
 */
function manhattanDistance(point1, point2) {
  return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}

/**
 * Reconstruct path from cameFrom map
 * @param {Object} cameFrom - Map of where each cell came from
 * @param {string} current - Current position key
 * @param {Array} start - Starting position [row, col]
 * @returns {Array} Array of coordinates representing the path
 */
function reconstructPath(cameFrom, current, start) {
  const path = [];
  let currentKey = current;
  
  while (currentKey) {
    const [row, col] = currentKey.split(',').map(Number);
    path.unshift([row, col]);
    currentKey = cameFrom[currentKey];
  }
  
  return path;
}

/**
 * Convert a path to R1C1 notation
 * @param {Array} path - Array of coordinates [row, col]
 * @returns {Array} Array of strings in R1C1 notation
 */
function convertToR1C1Notation(path) {
  return path.map(pos => `(r${pos[0]}c${pos[1]})`);
}

// Run the solution generator
generateSolution();

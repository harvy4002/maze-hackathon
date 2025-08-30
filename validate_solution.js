/**
 * Solution Validator for Maze Runner Competition
 * 
 * Validates whether a provided solution path correctly navigates from start to end
 * without going through any walls.
 * 
 * Usage: node validate_solution.js <maze_file> <solution_file>
 */

const fs = require('fs');

// Validate command line arguments
if (process.argv.length < 4) {
  console.error('Usage: node validate_solution.js <maze_file> <solution_file>');
  process.exit(1);
}

const mazeFile = process.argv[2];
const solutionFile = process.argv[3];

/**
 * Validate a solution path through a maze
 */
function validateSolution() {
  // Read the maze file
  let maze;
  try {
    const mazeData = fs.readFileSync(mazeFile, 'utf8');
    maze = JSON.parse(mazeData);
  } catch (err) {
    console.error(`Error reading maze file: ${err.message}`);
    process.exit(1);
  }

  // Read the solution file
  let solution;
  try {
    const solutionData = fs.readFileSync(solutionFile, 'utf8');
    solution = JSON.parse(solutionData);
  } catch (err) {
    console.error(`Error reading solution file: ${err.message}`);
    process.exit(1);
  }

  // Validate the solution
  const result = validate(maze, solution.path);
  
  console.log(`Validation Results for ${mazeFile}`);
  console.log(`Solution Length: ${solution.path.length} steps`);
  console.log(`Execution Time: ${solution.executionTime} ms`);
  
  if (result.valid) {
    console.log('Status: VALID ✅');
  } else {
    console.log('Status: INVALID ❌');
    console.log(`Error: ${result.error}`);
    if (result.invalidStep) {
      console.log(`Invalid Step: ${JSON.stringify(result.invalidStep)}`);
    }
  }
}

/**
 * Validate a path through a maze
 * @param {Object} maze - The maze object
 * @param {Array} path - Array of coordinates representing the path [row, col]
 * @returns {Object} Validation result {valid, error, invalidStep}
 */
function validate(maze, path) {
  // Convert walls to a set for faster lookup
  const wallsSet = new Set(maze.walls.map(wall => `${wall[0]},${wall[1]}`));
  
  // Check if path starts at the start point
  if (!arraysEqual(path[0], maze.start)) {
    return {
      valid: false,
      error: 'Path does not start at the maze start point',
      invalidStep: path[0]
    };
  }
  
  // Check if path ends at the end point
  if (!arraysEqual(path[path.length - 1], maze.end)) {
    return {
      valid: false,
      error: 'Path does not end at the maze end point',
      invalidStep: path[path.length - 1]
    };
  }
  
  // Check each step in the path
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    
    // Check if the step goes through a wall
    if (wallsSet.has(`${next[0]},${next[1]}`)) {
      return {
        valid: false,
        error: 'Path goes through a wall',
        invalidStep: next
      };
    }
    
    // Check if the step is a valid move (adjacent cell)
    const rowDiff = Math.abs(current[0] - next[0]);
    const colDiff = Math.abs(current[1] - next[1]);
    if (rowDiff + colDiff !== 1) {
      return {
        valid: false,
        error: 'Invalid move: steps must be to adjacent cells (not diagonal)',
        invalidStep: next
      };
    }
    
    // Check if the step is within maze bounds
    if (next[0] < 1 || next[0] > maze.height || next[1] < 1 || next[1] > maze.width) {
      return {
        valid: false,
        error: 'Path goes outside maze boundaries',
        invalidStep: next
      };
    }
  }
  
  return { valid: true };
}

/**
 * Compare two arrays for equality
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} Whether the arrays are equal
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// Run the validation
validateSolution();

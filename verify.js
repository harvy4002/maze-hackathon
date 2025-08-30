// verify.js
// Verifies if a solution path is valid for a given maze file.
// Usage: node verify.js <mazeFile> <solutionPath>
// Example: node verify.js mazes/maze1.txt "[(r1c1),(r2c1),(r3c1),(r3c2),(r3c3),(r4c3),(r5c3),(r5c2)]"


const fs = require('fs');

function parseMazeFromJson(filePath) {
  try {
    const mazeJson = fs.readFileSync(filePath, 'utf8');
    const mazeObj = JSON.parse(mazeJson);
    
    // Validate maze object
    if (!mazeObj.width || !mazeObj.height || !mazeObj.start || !mazeObj.end || !mazeObj.walls) {
      throw new Error("Invalid maze format: missing required properties");
    }
    
    // Create empty grid
    const maze = Array.from({ length: mazeObj.height }, () => Array(mazeObj.width).fill(' '));
    // Place walls (convert r1c1 to zero-indexed)
    for (const [row, col] of mazeObj.walls) {
      if (row - 1 >= 0 && row - 1 < mazeObj.height && col - 1 >= 0 && col - 1 < mazeObj.width) {
        maze[row - 1][col - 1] = '#';
      } else {
        console.warn(`Wall at [${row},${col}] is outside maze bounds, ignoring`);
      }
    }
    
    // Place start and end (convert r1c1 to zero-indexed)
    const [startRow, startCol] = mazeObj.start.map(x => x - 1);
    const [endRow, endCol] = mazeObj.end.map(x => x - 1);
    
    if (startRow < 0 || startRow >= mazeObj.height || startCol < 0 || startCol >= mazeObj.width) {
      throw new Error("Start position is outside maze bounds");
    }
    if (endRow < 0 || endRow >= mazeObj.height || endCol < 0 || endCol >= mazeObj.width) {
      throw new Error("End position is outside maze bounds");
    }
    
    maze[startRow][startCol] = 'S';
    maze[endRow][endCol] = 'E';
    return maze;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`File not found: ${filePath}`);
    } else {
      console.error(`Error parsing maze: ${error.message}`);
    }
    process.exit(1);
  }
}

function parseSolutionPath(pathStr) {
  try {
    // Expects format: [(r1c1),(r2c2),...]
    const regex = /\(r(\d+)c(\d+)\)/g;
    const result = [];
    let match;
    while ((match = regex.exec(pathStr)) !== null) {
      // Convert to zero-indexed for internal use
      // Correct order: [x, y] format to match other files
      result.push([parseInt(match[2]) - 1, parseInt(match[1]) - 1]);
    }
    
    if (result.length === 0) {
      throw new Error("No valid coordinates found in the solution path");
    }
    
    return result;
  } catch (error) {
    console.error(`Error parsing solution path: ${error.message}`);
    console.error("Solution path should be in the format: [(r1c1),(r2c2),...]");
    process.exit(1);
  }
}

function findChar(maze, char) {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === char) return [x, y];
    }
  }
  return null;
}

function isAdjacent(a, b) {
  const dx = Math.abs(a[0] - b[0]);
  const dy = Math.abs(a[1] - b[1]);
  return (dx + dy === 1);
}

function validatePath(maze, path) {
  if (path.length < 2) {
    console.error("Path is too short (must have at least start and end points)");
    return false;
  }
  
  const start = findChar(maze, 'S');
  const end = findChar(maze, 'E');
  
  if (!start || !end) {
    console.error("Maze must have start (S) and end (E) points");
    return false;
  }
  
  if (path[0][0] !== start[0] || path[0][1] !== start[1]) {
    console.error(`Path must start at (r${start[1]+1}c${start[0]+1}), but starts at (r${path[0][1]+1}c${path[0][0]+1})`);
    return false;
  }
  
  if (path[path.length - 1][0] !== end[0] || path[path.length - 1][1] !== end[1]) {
    console.error(`Path must end at (r${end[1]+1}c${end[0]+1}), but ends at (r${path[path.length-1][1]+1}c${path[path.length-1][0]+1})`);
    return false;
  }
  for (let i = 0; i < path.length; i++) {
    const [x, y] = path[i];
    // Enforce implied boundaries: cannot move outside the grid
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
      console.error(`Invalid move to (r${y+1}c${x+1}) - out of bounds.`);
      return false;
    }
    if (maze[y][x] === '#') {
      console.error(`Invalid move to (r${y+1}c${x+1}) - wall.`);
      return false;
    }
    if (i > 0 && !isAdjacent(path[i - 1], path[i])) {
      console.error(`Invalid move from (r${path[i-1][1]+1}c${path[i-1][0]+1}) to (r${y+1}c${x+1}) - not adjacent.`);
      return false;
    }
  }
  
  console.log(`Path is valid! Length: ${path.length} steps`);
  return true;
}

// Main
if (require.main === module) {
  try {
    const [,, mazeFile, solutionStr] = process.argv;
    if (!mazeFile || !solutionStr) {
      console.log('Usage: node verify.js <mazeFile> <solutionPath>');
      console.log('Example: node verify.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1)]"');
      process.exit(1);
    }
    
    console.log(`Verifying solution for maze: ${mazeFile}`);
    const maze = parseMazeFromJson(mazeFile);
    const path = parseSolutionPath(solutionStr);
    
    console.log(`Parsed path with ${path.length} steps`);
    const valid = validatePath(maze, path);
    
    // Visualize the solution if requested
    if (valid && process.argv.includes('--visual')) {
      console.log("\nVisual solution:");
      const visualMaze = JSON.parse(JSON.stringify(maze));
      for (const [x, y] of path) {
        if (visualMaze[y][x] === ' ') visualMaze[y][x] = '*';
      }
      visualMaze.forEach(row => console.log(row.join('')));
    }
    
    process.exit(valid ? 0 : 1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for testing
module.exports = { parseMazeFromJson, parseSolutionPath, validatePath };

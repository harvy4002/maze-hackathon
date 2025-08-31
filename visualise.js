// visualise.js
// Usage: node visualise.js <mazeFile> [<solutionPath>]
// Example: node visualise.js mazes/maze10.json "[(r2c2),(r3c2),(r4c2)]"

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
  if (!pathStr) return [];
  try {
    const regex = /\(r(\d+)c(\d+)\)/g;
    const result = [];
    let match;
    while ((match = regex.exec(pathStr)) !== null) {
      // Convert to zero-indexed, matching the format [x, y] used in other files
      result.push([parseInt(match[2]) - 1, parseInt(match[1]) - 1]);
    }
    return result;
  } catch (error) {
    console.error(`Error parsing solution path: ${error.message}`);
    console.error("Solution path should be in the format: [(r1c1),(r2c2),...]");
    return [];
  }
}

// Colors for terminal output (ANSI escape codes)
const colors = {
  reset: "\x1b[0m",
  wall: "\x1b[100m", // Dark gray background
  path: "\x1b[102m\x1b[30m", // Green background with black text
  start: "\x1b[104m\x1b[30m", // Blue background with black text
  end: "\x1b[101m\x1b[30m", // Red background with black text
  error: "\x1b[101m\x1b[30m", // Red background with black text for errors
  border: "\x1b[100m" // Dark gray background
};

function visualiseMaze(maze, path, useColors = true) {
  // Make a copy of the maze to avoid modifying the original
  const displayMaze = JSON.parse(JSON.stringify(maze));
  
  // Mark path with '*', but keep S and E
  // Add 'X' for path cells that go through walls
  for (const [col, row] of path) {
    if (row >= 0 && row < displayMaze.length && col >= 0 && col < displayMaze[0].length) {
      if (displayMaze[row][col] === ' ') {
        displayMaze[row][col] = '*';
      } else if (displayMaze[row][col] === '#') {
        // Mark where the path goes through walls with 'X'
        displayMaze[row][col] = 'X';
      }
      // Leave 'S' and 'E' unchanged
    }
  }
  
  const height = displayMaze.length;
  const width = displayMaze[0].length;
  
  // Print the maze without the outer wall border
  for (let r = 0; r < height; r++) {
    let rowStr = '';
    for (let c = 0; c < width; c++) {
      const cell = displayMaze[r][c];
      let cellStr = ' '; // Default is a space
      let color = colors.reset;
      
      if (cell === '#') {
        color = colors.wall;
      } else if (cell === '*') {
        color = colors.path;
        cellStr = '*';
      } else if (cell === 'X') {
        color = colors.error;
        cellStr = 'X';
      } else if (cell === 'S') {
        color = colors.start;
        cellStr = 'S';
      } else if (cell === 'E') {
        color = colors.end;
        cellStr = 'E';
      }
      
      rowStr += color + cellStr + colors.reset;
    }
    console.log(rowStr);
  }
  
  // Print maze statistics
  const wallCount = maze.flat().filter(cell => cell === '#').length;
  const pathCells = maze.flat().filter(cell => cell === ' ' || cell === 'S' || cell === 'E').length;
  const errorCount = displayMaze.flat().filter(cell => cell === 'X').length;
  
  console.log("\nMaze Statistics:");
  console.log(`- Dimensions: ${width}x${height}`);
  console.log(`- Open cells: ${pathCells}`);
  console.log(`- Walls: ${wallCount}`);
  if (path.length > 0) {
    console.log(`- Solution length: ${path.length} steps`);
    if (errorCount > 0) {
      console.log(`- Wall collisions: ${errorCount} (marked with X)`);
    }
  }
}

// Main
if (require.main === module) {
  try {
    const mazeFile = process.argv[2];
    const solutionStr = process.argv[3];
    // Always use colors (no option to disable)
    const useColors = true;
    
    if (!mazeFile) {
      console.log('Usage: node visualise.js <mazeFile> [<solutionPath>]');
      console.log('Example: node visualise.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1)]"');
      process.exit(1);
    }
    
    console.log(`Visualizing maze: ${mazeFile}`);
    const maze = parseMazeFromJson(mazeFile);
    const path = parseSolutionPath(solutionStr);
    
    if (path.length > 0) {
      console.log(`Solution path with ${path.length} steps provided`);
    }
    
    visualiseMaze(maze, path, useColors);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for testing or reuse
module.exports = { parseMazeFromJson, parseSolutionPath, visualiseMaze };

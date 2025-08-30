// failing-bot.js
// A bot that attempts to solve mazes but sometimes makes mistakes
// Usage: node failing-bot.js mazes/maze1.json

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

function findChar(maze, char) {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === char) return [x, y];
    }
  }
  return null;
}

// Flawed search algorithm that sometimes ignores walls
function flawedSearch(maze, start, end) {
  const queue = [[start, [start]]];
  const visited = new Set();
  const directions = [[0,1],[1,0],[0,-1],[-1,0]]; // Down, Right, Up, Left
  
  // Rate at which the bot tries to go through walls
  const wallErrorRate = 0.15; 
  
  while (queue.length) {
    const [current, path] = queue.shift();
    const key = current.join(',');
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (current[0] === end[0] && current[1] === end[1]) return path;
    
    for (const [dx, dy] of directions) {
      const nx = current[0] + dx;
      const ny = current[1] + dy;
      
      // Boundaries are always impassable
      if (ny < 0 || ny >= maze.length || nx < 0 || nx >= maze[0].length) continue;
      
      // Sometimes accidentally go through walls
      const ignoreWall = Math.random() < wallErrorRate;
      
      if ((maze[ny][nx] === ' ' || maze[ny][nx] === 'E' || 
          (maze[ny][nx] === '#' && ignoreWall)) && 
          !visited.has(nx + ',' + ny)) {
        
        // If going through a wall, pretend like it's not there in the path
        queue.push([[nx, ny], [...path, [nx, ny]]]);
      }
    }
  }
  return null;
}

function formatPath(path) {
  // Output in r1c1 format (row and column, one-indexed)
  return '[' + path.map(([x, y]) => `(r${y+1}c${x+1})`).join(',') + ']';
}

// Main
if (require.main === module) {
  try {
    const mazeFile = process.argv[2] || 'mazes/maze1.json';
    console.log(`Attempting to solve maze (may make mistakes): ${mazeFile}`);
    const maze = parseMazeFromJson(mazeFile);
    const start = findChar(maze, 'S');
    const end = findChar(maze, 'E');
    
    if (!start || !end) {
      console.error('Maze must have start (S) and end (E) points');
      process.exit(1);
    }
    
    console.log(`Start: (r${start[1]+1}c${start[0]+1}), End: (r${end[1]+1}c${end[0]+1})`);
    console.log("Finding path (might make mistakes)...");
    
    const startTime = process.hrtime();
    const path = flawedSearch(maze, start, end);
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedMs = seconds * 1000 + nanoseconds / 1000000;
    
    if (path) {
      console.log(`Solution found in ${elapsedMs.toFixed(2)}ms:`);
      console.log(formatPath(path));
      
      // Add a warning about possible incorrect path
      console.log("\nWARNING: This solution might be incorrect and go through walls!");
      
      // Check if the user wants a visual output
      if (process.argv.includes('--visual')) {
        console.log("\nVisual solution:");
        const visualMaze = JSON.parse(JSON.stringify(maze));
        for (const [x, y] of path) {
          if (visualMaze[y][x] === ' ') visualMaze[y][x] = '*';
          else if (visualMaze[y][x] === '#') visualMaze[y][x] = 'X'; // Mark where we went through walls
        }
        visualMaze.forEach(row => console.log(row.join('')));
      }
    } else {
      console.log('No solution found');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for testing
module.exports = { parseMazeFromJson, findChar, flawedSearch, formatPath };

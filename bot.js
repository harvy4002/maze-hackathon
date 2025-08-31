// bot.js
// Example bot that solves maze1.txt using BFS (Breadth-First Search)
// Usage: node bot.js mazes/maze1.txt


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

// Enhanced A* search algorithm with BFS fallback
function bfs(maze, start, end) {
  // Try A* first for efficiency
  const result = astar(maze, start, end);
  if (result) return result;
  
  // Fallback to standard BFS if A* fails
  console.log("A* failed, falling back to BFS...");
  const queue = [[start, [start]]];
  const visited = new Set();
  const directions = [[0,1],[1,0],[0,-1],[-1,0]]; // Down, Right, Up, Left
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
      if (
        ny < 0 || ny >= maze.length ||
        nx < 0 || nx >= maze[0].length
      ) continue;
      if (
        (maze[ny][nx] === ' ' || maze[ny][nx] === 'E') &&
        !visited.has(nx + ',' + ny)
      ) {
        queue.push([[nx, ny], [...path, [nx, ny]]]);
      }
    }
  }
  return null;
}

// A* search algorithm for more efficient pathfinding
function astar(maze, start, end) {
  const openSet = [start];
  const cameFrom = new Map();
  
  // g score is distance from start
  const gScore = new Map();
  gScore.set(start.join(','), 0);
  
  // f score is estimated distance from start to end through this node
  const fScore = new Map();
  fScore.set(start.join(','), heuristic(start, end));
  
  const directions = [[0,1],[1,0],[0,-1],[-1,0]]; // Down, Right, Up, Left
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    let current = openSet[0];
    let lowestScore = fScore.get(current.join(','));
    let currentIndex = 0;
    
    for (let i = 1; i < openSet.length; i++) {
      const node = openSet[i];
      const score = fScore.get(node.join(','));
      if (score < lowestScore) {
        current = node;
        lowestScore = score;
        currentIndex = i;
      }
    }
    
    // If reached end
    if (current[0] === end[0] && current[1] === end[1]) {
      return reconstructPath(cameFrom, current);
    }
    
    // Remove current from open set
    openSet.splice(currentIndex, 1);
    
    // Check neighbors
    for (const [dx, dy] of directions) {
      const nx = current[0] + dx;
      const ny = current[1] + dy;
      
      // Check boundaries
      if (ny < 0 || ny >= maze.length || nx < 0 || nx >= maze[0].length) continue;
      
      // Check if passable
      if (maze[ny][nx] !== ' ' && maze[ny][nx] !== 'E') continue;
      
      const neighbor = [nx, ny];
      const tentativeGScore = gScore.get(current.join(',')) + 1;
      
      if (!gScore.has(neighbor.join(',')) || tentativeGScore < gScore.get(neighbor.join(','))) {
        // This path is better
        cameFrom.set(neighbor.join(','), current);
        gScore.set(neighbor.join(','), tentativeGScore);
        fScore.set(neighbor.join(','), tentativeGScore + heuristic(neighbor, end));
        
        if (!openSet.some(node => node[0] === neighbor[0] && node[1] === neighbor[1])) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  // No path found
  return null;
}

// Manhattan distance heuristic
function heuristic(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// Reconstruct path from A* search
function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom.has(current.join(','))) {
    current = cameFrom.get(current.join(','));
    path.unshift(current);
  }
  return path;
}

function formatPath(path) {
  // Output in r1c1 format (row and column, one-indexed)
  return '[' + path.map(([x, y]) => `(r${y+1}c${x+1})`).join(',') + ']';
}

// Main
if (require.main === module) {
  try {
    const mazeFile = process.argv[2] || 'mazes/maze1.json';
    console.log(`Solving maze: ${mazeFile}`);
    const maze = parseMazeFromJson(mazeFile);
    const start = findChar(maze, 'S');
    const end = findChar(maze, 'E');
    
    if (!start || !end) {
      console.error('Maze must have start (S) and end (E) points');
      process.exit(1);
    }
    
    console.log(`Start: (r${start[1]+1}c${start[0]+1}), End: (r${end[1]+1}c${end[0]+1})`);
    console.log("Finding path...");
    
    const startTime = process.hrtime();
    const path = bfs(maze, start, end);
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedMs = seconds * 1000 + nanoseconds / 1000000;
    
    if (path) {
      console.log(`Solution found in ${elapsedMs.toFixed(2)}ms:`);
      console.log(formatPath(path));
      
      // Check if the user wants a visual output
      if (process.argv.includes('--visual')) {
        console.log("\nVisual solution:");
        const visualMaze = JSON.parse(JSON.stringify(maze));
        for (const [x, y] of path) {
          if (visualMaze[y][x] === ' ') visualMaze[y][x] = '*';
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
module.exports = { parseMazeFromJson, findChar, bfs, formatPath, astar };

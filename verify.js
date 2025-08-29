// verify.js
// Verifies if a solution path is valid for a given maze file.
// Usage: node verify.js <mazeFile> <solutionPath>
// Example: node verify.js mazes/maze1.txt "[(1,1),(2,1),(3,1),(3,2),(3,3),(4,3),(5,3),(5,2)]"


const fs = require('fs');

function parseMazeFromJson(filePath) {
  const mazeObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return mazeObj.maze;
}

function parseSolutionPath(pathStr) {
  // Expects format: [(r1c1),(r2c2),...]
  const regex = /\(r(\d+)c(\d+)\)/g;
  const result = [];
  let match;
  while ((match = regex.exec(pathStr)) !== null) {
    // Convert to zero-indexed for internal use
    result.push([parseInt(match[2]) - 1, parseInt(match[1]) - 1]);
  }
  return result;
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
  if (path.length < 2) return false;
  const start = findChar(maze, 'S');
  const end = findChar(maze, 'E');
  if (!start || !end) return false;
  if (path[0][0] !== start[0] || path[0][1] !== start[1]) return false;
  if (path[path.length - 1][0] !== end[0] || path[path.length - 1][1] !== end[1]) return false;
  for (let i = 0; i < path.length; i++) {
    const [x, y] = path[i];
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
    if (maze[y][x] === '#') return false;
    if (i > 0 && !isAdjacent(path[i - 1], path[i])) return false;
  }
  return true;
}

// Main
if (require.main === module) {
  const [,, mazeFile, solutionStr] = process.argv;
  if (!mazeFile || !solutionStr) {
    console.log('Usage: node verify.js <mazeFile> <solutionPath>');
    process.exit(1);
  }
  const maze = parseMazeFromJson(mazeFile);
  const path = parseSolutionPath(solutionStr);
  const valid = validatePath(maze, path);
  console.log(valid);
}

// Export for testing
module.exports = { parseMaze, parseSolutionPath, validatePath };

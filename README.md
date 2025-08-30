
# Maze Hackathon

Welcome to the Maze Hackathon! In this 2-hour challenge, teams of intermediate to senior JavaScript developers will compete to build a solution that can navigate a series of coded mazes.

## Objective

Your goal is to create a JavaScript program that reads a maze file, finds a path from the start (`S`) to the end (`E`), and outputs the solution path in the required format. The team that solves the most mazes, or solves them fastest and most efficiently, wins!

## Project Structure

- `maze1.json`, `maze2.json`, `maze3.json`: Example maze files
- `gen_prim_maze.js`: Maze generator using Prim's algorithm
- `bot.js`: Example bot to solve mazes using A* or BFS
- `verify.js`: Verifies if a solution path is valid
- `visualise.js`: Visualizes mazes and solution paths

## Rules

- **Maze Format:**
  - Mazes are 2D grids with walls and paths
  - `#` = Wall
  - ` ` (space) = Open space
  - `S` = Start
  - `E` = End
- **Moves:**
  - You may move up, down, left, or right (no diagonal moves).
  - You cannot move through walls (`#`).
  - Each move must be to an adjacent cell.
- **Scoring:**
  - 1 point for each maze solved.
  - Bonus points for shortest valid path.
  - Solutions must be verified using `verify.js`.
- **Submission:**
  - Output your solution path in the format: `[(r1c1),(r2c2),...]` (where r is row, c is column, both one-indexed).
  - Submit your code and solution paths for each maze.

## Maze File Format

Each maze is a JSON file with the following structure:

```json
{
  "width": <number>,
  "height": <number>,
  "start": [<row>, <col>],
  "end": [<row>, <col>],
  "walls": [ [<row>, <col>], ... ]
}
```

Example:
```json
{
  "width": 6,
  "height": 5,
  "start": [1, 1],
  "end": [2, 5],
  "walls": [
    [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],
    [1,0],[1,5],
    [2,0],
    [3,0],[3,1],[3,2],[3,5],
    [4,0],[4,1],[4,2],[4,3],[4,4],[4,5]
  ]
}
```

## Usage

### Generate a Maze

```
node gen_prim_maze.js <outputFile> <size>
```

Example:
```
node gen_prim_maze.js mazes/maze1.json 10
```

### Solve a Maze

```
node bot.js <mazeFile> [--visual]
```

Example:
```
node bot.js mazes/maze1.json --visual
```

### Verify a Solution

```
node verify.js <mazeFile> <solutionPath> [--visual]
```

Example:
```
node verify.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1),(r3c2)]" --visual
```

### Visualize a Maze

```
node visualise.js <mazeFile> [<solutionPath>] [--color]
```

Example:
```
node visualise.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1)]" --color
```

## Solution Path Format

Your program must output the solution path as a JavaScript array of coordinate pairs, e.g.:

```
[(r2c2),(r2c3),(r2c4),(r3c4),(r4c4),(r4c5),(r4c6),(r3c6)]
```

- Each pair is `(rXcY)` where `r` is the row and `c` is the column (both start at 1).
- The first pair must be the start position, and the last must be the end position.

## Algorithms

- **Maze Generation:** Modified Prim's algorithm with guaranteed connectivity
- **Path Finding:** A* algorithm with Manhattan distance heuristic (falls back to BFS if needed)

## Good Luck!

Work as a team, write clean code, and have fun!

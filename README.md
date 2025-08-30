
````markdown

# Maze Hackathon

Welcome to the Maze Hackathon! In this challenge, teams of intermediate to senior JavaScript developers will compete to build a solution that can navigate a series of coded mazes.

## Objective

Your goal is to create a JavaScript program that reads a maze file, finds a path from the start (`S`) to the end (`E`), and outputs the solution path in the required format. The team that solves the most mazes, or solves them fastest and most efficiently, wins!

## Project Structure

- `maze1.json`, `maze2.json`, etc.: Example maze files
- `gen_prim_maze.js`: Maze generator using Prim's algorithm
- `simple_anti_bot_maze.js`: Generator for anti-bot mazes
- `challenge_maze_gen.js`: Generator for advanced challenge mazes
- `bot.js`: Example bot to solve mazes using A* or BFS
- `failing-bot.js`: Example of a bot that makes mistakes
- `verify.js`: Verifies if a solution path is valid
- `visualise.js`: Visualizes mazes and solution paths
- `validate_solution.js`: Validates competition solutions
- `generate_solution.js`: Helper to generate solution files
- `COMPETITION.md`: Competition rules and details

## Competition

We now have a maze-solving competition! See [COMPETITION.md](./COMPETITION.md) for complete details. The competition includes multiple maze types from standard hedge mazes to specialized anti-bot mazes designed to challenge common pathfinding algorithms.

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

- **Maze Generation:** 
  - **Hedge Maze**: Modified Prim's algorithm with guaranteed connectivity
  - **Anti-Bot Maze**: Designed to exploit weaknesses in common pathfinding algorithms
  - **Challenge Maze**: Advanced maze with heuristic traps and memory-intensive regions
  
- **Path Finding:** A* algorithm with Manhattan distance heuristic (falls back to BFS if needed)

## Competition Tools

The repository includes several tools to help with the competition:

### Generate a Solution

```
node generate_solution.js <maze_file> <output_file> <team_name> <algorithm_name>
```

Example:
```
node generate_solution.js mazes/challenge_maze_100.json solutions/team1_solution.json "Team Awesome" "Modified A* with Memory Optimization"
```

### Validate a Solution

```
node validate_solution.js <maze_file> <solution_file>
```

Example:
```
node validate_solution.js mazes/challenge_maze_100.json solutions/team1_solution.json
```

## Good Luck!

Work as a team, write clean code, and have fun!

## Future Ideas for Maze Enhancement

### Interesting Start and End Point Placement

1. **Diameter-Based Placement**
   - Find the "diameter" of the maze - the longest possible path between any two cells
   - Place start and end points at these extreme positions for maximum challenge
   - Implemented using double BFS approach (first BFS to find farthest point A, second BFS from A to find farthest point B)

2. **Theme-Based Placement**
   - **Treasure Hunt**: Start at entrance, end at a "treasure room" (small open area)
   - **Escape Room**: Start in center, end at an edge
   - **Prison Break**: Start in an isolated "cell", end at an "exit gate"

3. **Constraint-Based Placement**
   - **Secret Passages**: Add teleportation points between locations
   - **One-Way Paths**: Include paths traversable in only one direction
   - **Key-Lock System**: Place "keys" that must be collected before reaching end

4. **Pattern-Based Placement**
   - **Spiral Pattern**: Start at center, end at outer edge
   - **Zig-Zag Pattern**: Force multiple traversals across the maze
   - **Concentric Rings**: Create connected rings, start inside and end outside

5. **Dynamic Difficulty Scaling**
   - **Small Mazes**: Simple opposite edges
   - **Medium Mazes**: Diagonal corners
   - **Large Mazes**: Complex paths requiring backtracking

6. **Island and Bridge Concept**
   - Create "islands" of open space connected by narrow "bridges"
   - Start on one island, end on another
   - Require traversal through multiple islands

7. **Multi-Goal Maze**
   - Implement checkpoints that must be visited in sequence
   - Each checkpoint requires different solving strategy

8. **False Goal Maze**
   - Add multiple potential endpoints with only one being correct
   - Include clues within maze structure to indicate true exit

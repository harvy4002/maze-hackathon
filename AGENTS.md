# Maze Runner Project - Conversation Summary

## Project Overview
This project is a maze generator and solver system, with a focus on implementing different maze generation algorithms.

## Key Components

### Hedge Maze Generator (`gen_prim_maze.js`)
- Implemented a hedge maze generator using Prim's algorithm
- Features include:
  - Size-adaptive complexity factors to adjust wall density based on maze size
  - Functions to break up long runs along edges for more natural maze appearance
  - Interior wall generation with strategic branch placement
  - Addition of "hedge islands" and branching paths
  - Path validation to ensure mazes are solvable
  - Start and end points can be anywhere in the maze
  - Need to complex enough at large size that bots will struggle
  - Uses r1c1 notation

### Maze Visualization (`visualise.js`)
- Visualizes mazes in ASCII format
- Can display paths through the maze using the `--color` option 
- Still plots incorrect paths but marks interactions with walls as a red X
- Shows maze statistics including dimensions, open cells, and walls

### Maze Solver (`bot.js`)
- Implements a path-finding algorithm to solve mazes
- Reports solution path and solving time

### Maze Solver (`failing-bot.js`)
- Implements a path-finding algorithm to solve mazes but makes mistakes
- Will accidently go through walls or make mistakes
- Reports solution path, even if incorrect and solving time

## Implemented Maze Types
1. **Hedge Maze**: A maze with passages carved through a field of walls, similar to garden hedge mazes
   - Uses randomized Prim's algorithm for generation
   - Has natural hedge-like features with dead ends and branching paths
   - Ensures no long runs along the edges

## Implementation Details

### Maze Generation Process
1. Initialize grid with all walls
2. Carve passages using Prim's algorithm
3. Add interior walls to create hedge-like structure
4. Break up long runs along edges
5. Add complexity (dead ends, loops)
6. Set entrance and exit inside  the maze
7. Validate path exists from start to end

### Complexity Adjustments
- Complexity is scales up based on maze size (more complexity for larger mazes)
- Parameters adjusted to ensure mazes remain solvable as they get larger
- Various factors for wall density, dead ends, and loops

## Recent Enhancements
- Made wall density and complexity adaptive to maze size
- Improved path validation with better error reporting
- Added function to break up long runs around edges
- Added size-based run length limits for edge passages
- Added more natural hedge-like features (branches, islands)
- Implemented `findOptimalStartEndPair` function to ensure start and end points are at least half the maze size apart
- Added strategic point selection from extreme corners and edges to find distant pairs
- Used both path distance and physical (diagonal) distance to optimize the point selection
- Included fallback mechanisms when minimum distance criteria can't be met

## Testing
- Successfully generated and solved mazes of various sizes (10x10, 20x20)
- Visualization confirmed proper maze structure
- Bot successfully found paths through all generated mazes
- Verified that start and end points are now properly distanced (minimum path length of half the maze size)
- Test on 20x20 maze showed minimum required path distance of 10 with actual path length of 14

## Testing Strategy: GTV Protocol (Generate-Test-Visualize)

The GTV Protocol is a comprehensive testing approach for maze generation and validation. This structured process ensures that all generated mazes meet requirements for structure, connectivity, and path distance.

### Step 1: Generate
```bash
node gen_prim_maze.js [output_file] [size]
```
- Creates a maze of specified size (e.g., 15x15, 20x20)
- Verifies internal connectivity during generation
- Confirms optimal start/end point placement
- Logs generation statistics and connectivity status

### Step 2: Test
```bash
node bot.js [maze_file]
```
- Solves the maze using pathfinding algorithm
- Confirms maze is solvable
- Reports solution path length and solving time
- Validates that path length meets minimum distance requirements

### Step 3: Visualize
```bash
# For maze visualization without solution path:
node visualise.js [maze_file]

# For maze visualization with solution path:
solution_path=$(node bot.js [maze_file] | grep -o '\[(r.*)]')
node visualise.js [maze_file] "$solution_path"
```
- Produces ASCII visualization of the maze
- Shows solution path through the maze (when provided)
- Verifies proper wall and path structure
- Confirms start and end points are correctly positioned
- Displays maze statistics including dimensions, open cells, and walls

### Success Criteria
- Maze is fully connected (all open cells reachable from start)
- Solution exists between start and end points
- Path length is at least half the maze size
- Visual inspection confirms proper maze structure
- Generation, solving, and visualization complete without errors

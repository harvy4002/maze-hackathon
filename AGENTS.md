````markdown
`````markdown
````markdown
# Maze Runner Project - Conversation Summary

## Project Overview
This project is a maze generator and solver system, with a focus on implementing different maze generation algorithms. It now includes a competition framework for testing and comparing maze-solving algorithms, along with a leaderboard system for tracking team performance.

## Competition
The project now features a maze-solving competition where participants create algorithms to navigate through progressively challenging mazes. See [COMPETITION.md](./COMPETITION.md) for complete details.

The competition includes:
- Multiple maze types from standard hedge mazes to specialized anti-bot mazes
- Increasingly difficult challenges that test algorithm adaptability
- A scoring system based on correctness and speed
- A structured evaluation process for fair comparison
- A leaderboard system for tracking team performance during the competition

## Project Structure
The project is now organized into the following folder structure:

```
mazerunner/
├── mazes/                 # Contains all maze JSON files
│   ├── maze1.json
│   ├── maze2.json
│   └── ...
├── leaderboard/           # Leaderboard system
│   ├── data/              # Storage for leaderboard data
│   │   └── leaderboard.json
│   ├── public/            # Web assets
│   │   └── leaderboard.css
│   ├── leaderboard.js     # Main leaderboard script
│   └── add_verification_point.js
├── solutions/             # Team solutions
│   ├── Team_Name_1/
│   │   └── solution_files.json
│   └── Team_Name_2/
│       └── solution_files.json
└── [other project files]
```

## Key Components

### Leaderboard System
The project includes a web-based leaderboard system to track team performance during the competition:

#### Leaderboard Components
1. **Main Leaderboard Script (`leaderboard/leaderboard.js`)**
   - Updates leaderboard with team solutions
   - Starts a web server to display the leaderboard
   - Validates solutions and awards points
   - Organizes solutions in the solutions directory

2. **Verification Points System (`leaderboard/add_verification_point.js`)**
   - Allows adding points to teams for verifying other teams' solutions
   - Provides both command-line and interactive interfaces
   - Updates the leaderboard with verification points

3. **Web Interface**
   - Displays a real-time leaderboard with auto-refresh
   - Ranks teams based on total points, mazes solved, and execution time
   - Highlights top teams with gold, silver, and bronze
   - Shows detailed statistics for each team

#### Scoring System
- Teams earn 3 points for each successfully solved maze
- Teams earn 1 point for each verified solution from another team
- Teams are ranked by total points, then by mazes solved, then by average execution time

#### Usage
See [LEADERBOARD.md](./LEADERBOARD.md) for complete details on using the leaderboard system.

### Hedge Maze Generator (`gen_prim_maze.js`)
- Implemented a hedge maze generator using Prim's algorithm
- Features include:
  - Size-adaptive complexity factors to adjust wall density based on maze size
  - Functions to break up long runs along edges for more natural maze appearance
  - Interior wall generation with strategic branch placement
  - Addition of "hedge islands" and branching paths
  - Path validation to ensure mazes are solvable
  - Strategic placement of start and end points with:
    - Both row and column differences of at least half the maze size
    - Multiple selection strategies with fallback mechanisms
    - Scoring system that balances path length and positional separation
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

2. **Simple Anti-Bot Maze**: A maze specifically designed to challenge pathfinding algorithms
   - Creates deceptive paths that exploit A* heuristics
   - Includes memory-intensive regions with many branching paths
   - Adds strategic loops to confuse algorithms
   - Places start and end points to maximize path complexity

3. **Challenge Maze**: A highly sophisticated maze designed to exploit weaknesses in common pathfinding algorithms
   - Features a large open area in the middle to confuse heuristic-based algorithms
   - Includes heuristic traps that initially move toward the goal but lead away
   - Creates narrow winding passages that force sequential traversal
   - Implements complex memory-intensive regions
   - Places start and end points in opposite corners to maximize path length

## Implementation Details

### Maze Generation Process
1. Initialize grid with all walls
2. Carve passages using Prim's algorithm
3. Add interior walls to create hedge-like structure
4. Break up long runs along edges
5. Add complexity (dead ends, loops)
6. Set entrance and exit points using advanced placement algorithm
7. Validate path exists from start to end

### Start/End Point Placement Algorithm
1. **Primary Selection Method**:
   - Tests multiple potential starting points across the maze
   - For each point, finds the furthest reachable cell
   - Calculates both row and column differences
   - Enforces that both differences must be at least half the maze size
   - Scores each pair based on path length and positional separation
   - Selects the pair with the highest score that meets all requirements

2. **Corner-to-Corner Fallback**:
   - Activates when primary method fails to find suitable points
   - Identifies potential points in each corner region
   - Calculates physical distance and row/column differences
   - Applies penalties for pairs that don't meet half-size requirement
   - Selects diagonally opposite corners when possible

3. **Random Cell Fallback**:
   - Used as last resort when corner approach fails
   - Makes multiple attempts with different random starting points
   - For each attempt, finds the furthest reachable cell
   - Prioritizes pairs that meet the half-size requirement in both dimensions
   - Uses weighted scoring to balance path length and separation

4. **Absolute Fallback**:
   - Final safety mechanism if all other methods fail
   - Places start at [1,1] and end at opposite corner
   - Performs mathematical adjustment to ensure half-size separation
   - Guarantees minimum required separation in both dimensions

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
- Implemented enhanced start and end point placement:
  - Enforced that both row and column differences between start and end points must be at least half the maze size
  - Created multiple selection strategies with increasing fallback mechanisms
  - Used scoring system that combines path length and positional separation
  - Added penalties for points that don't meet the half-size requirement in both dimensions
- Used both path distance and physical (diagonal) distance to optimize the point selection
- Included fallback mechanisms when strict distance criteria can't be met
- Created new maze generators designed to challenge bot algorithms:
  - `simple_anti_bot_maze.js`: Creates mazes with deceptive paths and strategic loops
  - `challenge_maze_gen.js`: Implements sophisticated traps like heuristic traps and memory-intensive regions
- Designed a competition framework for comparing maze-solving algorithms
- Implemented a comprehensive leaderboard system:
  - Created a web-based leaderboard to display team rankings and statistics
  - Implemented a scoring system (3 points per solved maze, 1 point per verification)
  - Developed a verification points tracking system
  - Reorganized the project structure with dedicated folders for leaderboard, solutions, and mazes
  - Added documentation for using the leaderboard system (LEADERBOARD.md)

## Testing
- Successfully generated and solved mazes of various sizes (10x10, 20x20, 30x30, 40x40)
- Visualization confirmed proper maze structure
- Bot successfully found paths through all generated mazes
- Verified that start and end points are now properly distanced:
  - Both row and column differences between start and end points are at least half the maze size
  - This creates more challenging mazes that require traversal across significant portions of the grid
  - Tested with 30x30 maze showing row difference of 28 and column difference of 27 (both exceeding half-size of 15.5)
- Test on larger mazes showed solution path lengths of 50+ steps, creating appropriately challenging puzzles
- Tested the leaderboard system:
  - Successfully added team solutions to the leaderboard
  - Verified that points are awarded correctly (3 points per solved maze)
  - Tested the verification points system (1 point per verification)
  - Confirmed the web server displays the leaderboard correctly
  - Verified that the leaderboard updates when new solutions are added

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

### Step 4: Leaderboard Testing
```bash
# Start the leaderboard web server
node leaderboard/leaderboard.js serve

# Add a solution to the leaderboard
node leaderboard/leaderboard.js update path/to/solution.json

# Add a verification point to a team
node leaderboard/add_verification_point.js "Team Name"

# Process all solutions in the solutions directory
node leaderboard/leaderboard.js process-all
```
- Verifies that the leaderboard system is working correctly
- Confirms that points are calculated and displayed properly
- Tests the web interface and auto-refresh functionality
- Ensures solutions are stored in the correct locations
- Validates the verification points system

### Success Criteria
- Maze is fully connected (all open cells reachable from start)
- Solution exists between start and end points
- Path length is at least half the maze size
- Both row and column differences between start and end points are at least half the maze size
- Visual inspection confirms proper maze structure
- Generation, solving, and visualization complete without errors
- Leaderboard correctly displays team rankings based on points
- Points are calculated correctly (3 points per solved maze, 1 point per verification)
- Solutions are properly stored in the solutions directory
- Web interface is responsive and visually appealing
`````

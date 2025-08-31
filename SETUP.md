# Maze Runner Challenge Setup Guide

This guide provides instructions for setting up and using the Maze Runner Challenge materials.

## Getting Started

### Repository Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/harvy4002/maze-hackathon.git
   cd maze-hackathon
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Project Structure

- `/mazes` - Contains all maze files for the competition
  - Standard mazes: `maze1.json` through `maze10.json`
  - Anti-bot mazes: `anti_bot_maze_200.json`
  - Challenge mazes: `challenge_maze.json`, `challenge_maze_100.json`, `challenge_maze_200.json`
  
- `/templates` - Contains solution templates
  - `solution_template.json` - Template for solution submissions

- `/solutions` - Directory where you should save your solutions
  - Name your solutions as `[TEAM_NAME]_[MAZE_NAME]_solution.json`

- Script files:
  - `verify.js` - Simple solution verification tool
  - `validate_solution.js` - Comprehensive solution validation
  - `visualise.js` - Tool to visualize mazes and solutions

## Using the Tools

### Visualizing a Maze

To visualize a maze file:

```bash
node visualise.js mazes/maze1.json --color
```

To visualize a maze with a solution path:

```bash
node visualise.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1)]" --color
```

### Verifying a Solution

To verify if a solution path is valid:

```bash
node verify.js mazes/maze1.json "[(r1c1),(r2c1),(r3c1)]"
```

### Validating a Solution File

To validate a complete solution file:

```bash
node validate_solution.js mazes/maze1.json solutions/your_team_maze1_solution.json
```

## Solution Template Format

Your solution files should follow this format:

```json
{
  "team": "YOUR_TEAM_NAME",
  "mazeName": "MAZE_FILE_NAME",
  "path": [
    "(r1c1)",
    "(r1c2)",
    "..."
  ],
  "executionTime": 0.00
}
```

## Submission Process

1. Create your solution files for each maze you solve
2. Validate your solutions using the validation tools
3. Submit your solutions according to the competition guidelines

## Troubleshooting

If you encounter any issues:

- Ensure you're using the correct format for paths and solution files
- Check that your solution starts at the maze start point and ends at the end point
- Verify that your path only moves between adjacent cells and doesn't go through walls

For additional help, refer to the `README.md` and `COMPETITION.md` files.

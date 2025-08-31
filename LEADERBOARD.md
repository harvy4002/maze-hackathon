````markdown
# Maze Runner Leaderboard System

This system provides a way to track and display team solutions for the Maze Runner Competition. It includes functionality to update the leaderboard with validated solutions and display the results on a web-based leaderboard suitable for a big screen display.

## Folder Structure

The leaderboard system uses the following file structure:

```
mazerunner/
├── leaderboard/            # Leaderboard system
│   ├── data/               # Storage for leaderboard data
│   │   └── leaderboard.json  # Current leaderboard state
│   ├── public/             # Web assets
│   │   └── leaderboard.css   # Styling for the leaderboard
│   ├── leaderboard.js      # Main leaderboard script
│   └── add_verification_point.js  # Tool for adding verification points
├── solutions/              # Directory to store team solutions
│   └── [Team_Name]/        # Directory for each team's solutions
│       └── solution.json   # Team's solution file
└── [other project files]
```

## Features

- Update leaderboard with validated team solutions
- Track multiple solutions per team
- Award 3 points for each solved maze
- Award 1 point for each verified solution from another team
- Sort teams by points, mazes solved, and average execution time
- Display an attractive, auto-refreshing leaderboard
- Show detailed statistics for each team
- Highlight top-performing teams

## Usage

### Updating the Leaderboard with Solutions

To add a team's solution to the leaderboard:

```bash
node leaderboard/leaderboard.js update path/to/solution.json
```

This will:
1. Validate the solution against the corresponding maze
2. Add it to the leaderboard if valid
3. Replace existing solutions if the new one is faster
4. Copy the solution file to the solutions directory

### Processing All Solutions

To process all solutions in the solutions directory:

```bash
node leaderboard/leaderboard.js process-all
```

This will scan the `solutions` directory and add all solution files to the leaderboard.

### Adding Verification Points

To add a verification point to a team for validating another team's solution:

```bash
node leaderboard/add_verification_point.js [team_name]
```

If you don't specify a team name, the script will run in interactive mode, allowing you to select a team from a list.

### Starting the Leaderboard Display

To start the web server and display the leaderboard:

```bash
node leaderboard/leaderboard.js serve [port]
```

By default, the server runs on port 3000. Access the leaderboard at `http://localhost:3000/`.

### Example

```bash
# Add a solution to the leaderboard
node leaderboard/leaderboard.js update ./team1/solution.json

# Start the leaderboard display
node leaderboard/leaderboard.js serve 8080
```

## Solution Format

Each solution file should be a JSON file with the following structure:

```json
{
  "team": "Team Name",
  "mazeName": "maze1.json",
  "path": [
    "(r1c1)",
    "(r1c2)",
    "..."
  ],
  "executionTime": 25.31
}
```

Where:
- `team`: The name of the team
- `mazeName`: The name of the maze file in the `mazes/` directory
- `path`: An array of coordinates representing the path through the maze
- `executionTime`: The time taken to solve the maze (in milliseconds)

## Leaderboard Display

The leaderboard shows:
- Team rankings based on points, mazes solved, and execution time
- Teams earn 3 points for each successfully solved maze
- Teams earn 1 point for each verification of another team's solution
- Gold, silver, and bronze highlighting for the top three teams
- Detailed statistics for each team
- Total number of teams, solutions, and points
- Fastest solution time

The leaderboard automatically refreshes every 10 seconds to show the latest results.

## Testing

Sample solution files are provided in the `test/` directory for testing the leaderboard system:

```bash
# Add test solutions to the leaderboard
node leaderboard.js update ./test/solution1.json
node leaderboard.js update ./test/solution2.json
node leaderboard.js update ./test/solution3.json

# Start the leaderboard display
node leaderboard.js serve
```

## Notes

- The leaderboard data is stored in `leaderboard/data/leaderboard.json`
- Team solutions are stored in the `solutions/[Team_Name]` directory
- Teams are ranked first by total points (solution points + verification points), then by number of mazes solved, then by average execution time
- Teams earn 3 points for each successfully solved maze
- Teams earn 1 point for each successful verification of another team's solution
- Only valid solutions are added to the leaderboard
- If a team solves the same maze multiple times, only the fastest solution is kept
- You can manually edit the leaderboard.json file if needed, just be sure to maintain the correct structure

## Tips for Competition Organizers

1. Set up the leaderboard server on a machine connected to a large display or projector
2. Create a directory where teams can drop their solution files
3. Run the leaderboard in serve mode to display real-time results
4. Use the add_verification_point.js script to award points for verifications
5. Remind teams that both solving mazes (3 points each) and verifying solutions (1 point each) contribute to their total score
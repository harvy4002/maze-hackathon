
# Maze Maze Hackathon


Welcome to the Maze Hackathon! In this 2-hour challenge, teams of intermediate to senior JavaScript developers will compete to build a solution that can navigate a series of coded mazes.


## Objective

Your goal is to create a JavaScript program that reads a maze file, finds a path from the start (`S`) to the end (`E`), and outputs the solution path in the required format. The team that solves the most mazes, or solves them fastest and most efficiently, wins!

## Rules


- **Maze Format:**
  - Mazes are 2D grids in text files using these characters:
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

Each maze is a JSON file containing a 2D array. Example:

```
{
  "maze": [
    ["#", "#", "#", "#", "#", "#"],
    ["#", "S", " ", " ", " ", "#"],
    ["#", "#", "#", " ", "#", "E"],
    ["#", " ", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#", "#"]
  ]
}
```


## Solution Path Format

Your program must output the solution path as a JavaScript array of coordinate pairs, e.g.:

```
[(r2c2),(r2c3),(r2c4),(r3c4),(r4c4),(r4c5),(r4c6),(r3c6)]
```

- Each pair is `(rXcY)` where `r` is the row and `c` is the column (both start at 1).
- The first pair must be the start position, and the last must be the end position.


## Example

Given the above maze, a valid solution path might be:

```
[(r2c2),(r2c3),(r2c4),(r3c4),(r4c4),(r4c5),(r4c6),(r3c6)]
```


## Verification


Use `verify.js` to check if a solution path is valid for a given maze. Example usage:

```
node verify.js mazes/maze1.json "[(r2c2),(r2c3),(r2c4),(r3c4),(r4c4),(r4c5),(r4c6),(r3c6)]"
```


## Good Luck!

Work as a team, write clean code, and have fun!

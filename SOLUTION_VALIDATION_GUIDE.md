# Cross-Team Solution Validation Guide

This guide outlines how to properly validate another team's maze solutions. During the hackathon, each team will be assigned to validate the solutions from another team to ensure objective assessment.

## Maze Format Reminder

Each maze is a JSON file with the following structure:

```json
{
  "width": 100,
  "height": 100,
  "start": [2, 99],
  "end": [99, 2],
  "walls": [[1, 1], [1, 2], ...]
}
```

Where:
- `width` and `height` define the maze dimensions
- `start` and `end` are the starting and ending positions [row, column] (1-indexed)
- `walls` is an array of wall positions [row, column] (1-indexed)

## Solution Validation Requirements

A valid solution must satisfy ALL of the following criteria:

1. **Start and End Points:**
   - First coordinate must be the maze's start point
   - Last coordinate must be the maze's end point

2. **Valid Moves:**
   - Each move must be to an adjacent cell (up, down, left, or right)
   - Diagonal moves are NOT allowed
   - No step can go through a wall

3. **Path Continuity:**
   - The path must be continuous (no jumps)
   - Each step must be adjacent to the previous step

## Cross-Team Validation Process

1. **Exchange Solutions:**
   - Receive solution files from the team you're validating
   - Each solution file should contain an array of coordinates representing the path

2. **Validate Each Solution:**
   - For each maze solution, run your validation algorithm
   - Record whether each solution is valid or invalid
   - Note any specific issues found

3. **Verify Execution Times:**
   - While you can't directly verify the reported execution times, check if they seem reasonable
   - Flag any suspiciously fast times for discussion

4. **Complete Validation Form:**
   - Fill out the validation section of the team reporting form
   - Mark each solution as valid or invalid
   - Provide specific feedback on any invalid solutions

## Sample Validation Algorithm

Here's a pseudocode algorithm you can implement to validate your solutions:

```
function validateSolution(maze, path):
    // Check if path starts at start point
    if path[0] != maze.start:
        return false, "Path doesn't start at maze start point"
    
    // Check if path ends at end point
    if path[path.length-1] != maze.end:
        return false, "Path doesn't end at maze end point"
    
    // Convert walls to a set/dictionary for faster lookup
    wallsSet = convertToSet(maze.walls)
    
    // Check each step in the path
    for i from 0 to path.length - 2:
        current = path[i]
        next = path[i+1]
        
        // Check if next step is through a wall
        if next is in wallsSet:
            return false, "Path goes through a wall at step " + (i+1)
        
        // Check if move is valid (adjacent cell, not diagonal)
        rowDiff = abs(current[0] - next[0])
        colDiff = abs(current[1] - next[1])
        
        if rowDiff + colDiff != 1:
            return false, "Invalid move at step " + (i+1) + ": not adjacent"
        
        // Check if within maze bounds
        if next[0] < 1 or next[0] > maze.height or next[1] < 1 or next[1] > maze.width:
            return false, "Path goes outside maze boundaries at step " + (i+1)
    
    return true, "Path is valid"
```

## Expected Solution Format

Your solution should be represented as an array of coordinates, where each coordinate is a [row, column] pair. For example:

```
[
  [2, 99],
  [2, 98],
  [3, 98],
  ...
  [99, 2]
]
```

## Measuring Execution Time

To measure how fast your algorithm solves a maze:

1. Record the start time before beginning the pathfinding algorithm
2. Record the end time after finding a valid path
3. Calculate the difference to get execution time in milliseconds

Example (JavaScript):
```javascript
const startTime = performance.now();
const path = findPath(maze);
const endTime = performance.now();
const executionTime = (endTime - startTime).toFixed(2);
console.log(`Solution found in ${executionTime}ms`);
```

## Common Validation Errors

1. **Off-by-one errors:** Remember maze coordinates are 1-indexed
2. **Wall collisions:** Ensure your path doesn't go through any walls
3. **Diagonal moves:** Ensure all moves are orthogonal (up, down, left, right)
4. **Path discontinuity:** Each point must be adjacent to the previous point

## Reporting Your Results

On your team reporting form, include:
- Number of mazes solved correctly
- Execution time for each maze
- Path length for each maze
- Brief description of your validation process

Remember: Honesty in self-reporting is essential for a fair competition!

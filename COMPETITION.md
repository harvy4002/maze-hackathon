# Maze Runner Challenge

## Competition Overview

Welcome to the Maze Runner Challenge! This competition tests your ability to create efficient maze-solving algorithms that can navigate through increasingly complex mazes. From standard hedge mazes to specialized anti-bot mazes designed to exploit common pathfinding weaknesses, your solver will face a range of challenges.

## Objective

Design and implement a maze-solving algorithm that can efficiently find paths through all provided maze files. Your goal is to:

1. Find the correct path from start to end in each maze
2. Minimize the total solving time across all mazes
3. Handle increasingly difficult maze types and sizes

## Provided Materials

Participants will receive:
- A set of JSON maze files of varying complexity and size
- A description of the maze format
- Example visualizations of the mazes
- A validation script to verify your solutions

## Maze Format

Each maze is provided as a JSON file with the following structure:

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

## Maze Types

The competition includes several types of mazes:

1. **Standard Hedge Mazes**: Traditional mazes generated using Prim's algorithm
2. **Simple Anti-Bot Mazes**: Mazes with deceptive paths and strategic loops
3. **Challenge Mazes**: Advanced mazes with heuristic traps and memory-intensive regions

The difficulty increases progressively across maze types and sizes.

## Scoring

Your solution will be scored based on:

1. **Correctness** (70%): Did your algorithm find the correct path?
   - Solutions that go through walls are disqualified
   - Solutions that don't reach the end point receive 0 points

2. **Speed** (30%): How quickly did your algorithm solve each maze?
   - Total execution time across all mazes
   - Time is measured from when your algorithm starts to when it outputs a solution

## Submission Requirements

Your submission should include:

1. **Source Code**: Your maze-solving algorithm implementation
2. **README**: Documentation explaining:
   - The algorithm(s) used
   - How to run your solution
   - Any optimizations made for different maze types
   - Runtime and space complexity analysis

3. **Output File**: For each maze, provide a solution file with:
   - The path taken from start to end as a sequence of coordinates
   - The execution time

## Technical Constraints

- Your solution must run in a reasonable amount of time (< 1 minute per maze)
- Memory usage should be reasonable for the maze size
- Your solution should work for all provided maze types and sizes

## Evaluation Process

1. **Validation**: All submitted solutions will be validated for correctness
2. **Timing**: Solutions will be timed on the same hardware for fair comparison
3. **Ranking**: Teams/individuals will be ranked based on the scoring criteria

## Challenge Levels

The competition includes 3 levels of increasing difficulty:

### Level 1: Standard Mazes
- Hedge mazes of various sizes (10x10 to 50x50)
- Basic maze navigation skills required
- Reasonable memory requirements

### Level 2: Anti-Bot Mazes
- Simple anti-bot mazes designed to exploit heuristic weaknesses
- Sizes from 50x50 to 150x150
- Tests algorithm adaptability to deceptive paths

### Level 3: Challenge Mazes
- Advanced mazes with sophisticated traps
- Sizes from 100x100 to 200x200
- Tests advanced pathfinding capabilities and memory efficiency

## Tips for Success

1. **Understand the weaknesses** of common pathfinding algorithms
2. **Implement multiple strategies** that can adapt to different maze types
3. **Consider memory optimization** for larger mazes
4. **Test your solution** against all provided maze types
5. **Focus on robustness** rather than optimizing for a specific maze type

## Timeline

- Registration Deadline: [Date]
- Submission Deadline: [Date]
- Results Announcement: [Date]

## Prizes

- 1st Place: [Prize details]
- 2nd Place: [Prize details]
- 3rd Place: [Prize details]
- Special recognition for most innovative algorithm

## Contact

For questions or clarifications, please contact [organizer contact details].

---

Good luck, and may the best algorithm win!

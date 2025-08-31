# Maze Runner Hackathon: 1.5-Hour Breakdown

## Hackathon Concept
A fast-paced 1.5-hour challenge where 60 engineers in teams compete to create algorithms that can solve increasingly complex mazes. Teams will only receive the maze files and will need to build their solutions from scratch.

## Team Structure
- 15 teams of 4 engineers each
- Teams should designate roles internally:
  - Algorithm designer(s)
  - Coder(s)
  - Tester(s)
  - Solution validator/reporter

## Pre-Hackathon Preparation
- Prepare and distribute maze files only (no starter code)
- Create blank leaderboard template
- Prepare a brief explanation of maze format and scoring criteria
- Prepare team registration forms with unique team IDs

## Detailed Schedule

### Introduction (10 minutes) - 0:00-0:10
- Welcome and introduction to the Maze Runner challenge
- Explanation of maze format:
  ```json
  {
    "width": 100,
    "height": 100,
    "start": [2, 99],
    "end": [99, 2],
    "walls": [[1, 1], [1, 2], ...]
  }
  ```
- Explanation of competition rules:
  - Teams will only receive maze files
  - Solutions must find a valid path from start to end
  - Path must not go through walls
  - Each move can only be to adjacent cells (no diagonals)
  - Format for solutions: array of coordinates [(r1,c1), (r2,c2), ...]
- Scoring criteria:
  - 3 points for each correctly solved and verified maze
  - 1 point for each maze solution you verify for another team
  - -5000 points penalty for any incorrect verification
  - Bonus points for fastest solutions to challenge mazes
- Continuous submission process:
  - Teams can submit solutions at any time during the hackathon
  - Leaderboard will be updated continuously as solutions are verified
  - Submit solutions as soon as they're ready for potential early points
- Cross-team validation process explanation:
  - Teams will exchange solutions with another team for validation
  - Validating teams will verify correctness of paths and solution times
  - Each team needs to create a validation function to check another team's solutions
- Final Q&A before starting
  - Teams will exchange solutions with another team for validation
  - Validating teams will verify correctness of paths and solution times
  - Each team needs to create a validation function to check another team's solutions
- Final Q&A before starting

### Coding Session 1 (25 minutes) - 0:10-0:35
**Focus:** Understanding maze format, visualization, and implementing basic algorithms

**Expected Checkpoint #1:** 
- Parse maze JSON file format
- Implement maze visualization to understand maze structure
- Implement a basic pathfinding algorithm (BFS, DFS, A*)
- Successfully solve at least one simple maze (10x10 or 20x20)

**Announcement at 0:20:**
"By this point, teams should be working on visualizing the mazes to understand their structure. Visualization is key to developing effective solutions."

**Announcement at 0:35:**
"You should now have a basic algorithm working and be able to solve at least the smallest maze. Let's see a quick show of hands - how many teams have solved at least one maze?"

### Quick Check-in (5 minutes) - 0:35-0:40
- Brief status update from each team
- Clarification of any common issues encountered
- Introduction of the next set of mazes (medium difficulty)
- Reminder about continuous submission:
  - "Remember to submit your solutions as soon as they're ready"
  - "The leaderboard will be updated throughout the hackathon"

### Coding Session 2 (25 minutes) - 0:40-1:05
**Focus:** Optimization and tackling larger, more complex mazes

**Expected Checkpoint #2:**
- Scale solution to handle larger mazes efficiently
- Implement optimizations to handle anti-bot features
- Successfully solve medium-sized mazes (50x50)
- Begin working on challenge mazes
- Continue submitting solutions as they are completed

**Announcement at 0:50:**
"Check the leaderboard for current standings. Remember to submit your solutions as soon as they're ready!"

**Announcement at 1:00:**
"You have 5 minutes left in this session. Make sure you're validating your solutions and keeping track of which mazes you've solved and your solving times."

### Final Sprint and Cross-Team Validation (5 minutes) - 1:05-1:10
**Focus:** Solution finalization and validation

**Teams should:**
- Finalize and test all remaining solutions
- Submit any final solutions for validation
- Prepare brief summary of approach

**Cross-Team Validation Process:**
- Teams will be paired (Team A validates Team B's solutions, Team B validates Team C's, etc.)
- Each team validates solutions submitted by their assigned team
- Validating teams use their validation algorithm to verify solutions
- Final leaderboard updates are made with latest submissions

### Team Experience Sharing (20 minutes) - 1:10-1:30
- Cross-team validation results sharing (5 minutes):
  - Each validation team reports on their partner team's solutions
  - Announce which solutions were successfully validated
  - Report any invalid solutions found and why they failed

- Team approach sharing (15 minutes):
  - Each team gets 1 minute to share:
    - Number of mazes they solved (as validated by their partner team)
    - Their approach to solving the mazes
    - Key challenges encountered
    - Interesting algorithms or optimizations used

### Leaderboard Reveal and Wrap-up (Remaining time)
- Display updated leaderboard with:
  - Team rankings based on total points:
    - 3 points per solved maze
    - 1 point per verification performed
    - -5000 points per incorrect verification
  - Fastest solutions for challenge mazes with bonus points
  - Recognition for innovative approaches
- Announcement of top 3 teams
- Final thoughts and feedback collection

## Maze Progression

Teams will be given the following maze files only:

1. **Level 1: Standard Mazes** (All teams should solve these)
   - maze_10x10.json
   - maze_20x20.json
   - maze_30x30.json

2. **Level 2: Medium Difficulty** (Most teams should solve some of these)
   - maze_50x50.json
   - anti_bot_maze_50.json
   - maze_75x75.json

3. **Level 3: Challenge Mazes** (For advanced teams only)
   - challenge_maze_100.json
   - anti_bot_maze_150.json
   - challenge_maze_200.json

## Self-Marking Guidelines

Teams will validate their partner team's solutions based on the following criteria:

1. **Solution Validity:**
   - Path must start at the specified start point
   - Path must end at the specified end point
   - Path must not go through any walls
   - Each move must be to an adjacent cell (no diagonals)

2. **Solution Verification Method:**
   - Teams should write code to verify:
     - Each step in path is a valid move (adjacent to previous)
     - No step in the path goes through a wall
     - Path connects start to end
   - Teams confirm reported solving time is reasonable
   - Any discrepancies should be discussed between teams
   - Remember: Incorrect verifications result in a -5000 point penalty

3. **Reporting Format:**
   ```
   Team Being Validated: [ID]
   Validating Team: [ID]
   Mazes Successfully Validated: [Number]
   - maze_10x10.json: Valid solution, [time] ms
   - maze_20x20.json: Valid solution, [time] ms
   [etc.]
   Invalid Solutions (if any):
   - [maze_name]: [Reason for invalidation]
   ```

## Progression Expectations

1. **Minimum Expectation (All teams):**
   - Solve at least one 10x10 or 20x20 maze
   - Implement basic BFS or DFS algorithm

2. **Average Expectation (Most teams):**
   - Solve all Level 1 mazes and at least one Level 2 maze
   - Implement A* or similar optimized algorithm

3. **Stretch Goal (Advanced teams):**
   - Solve multiple Level 2 mazes and attempt Level 3
   - Implement advanced optimizations

## Tips for Organizers

1. **Maze Distribution:**
   - Provide all maze files at the beginning
   - Make the maze format clear with an example
   - Include a simple visualization script to help teams visualize the mazes

2. **Continuous Submission Management:**
   - Set up a central submission system (e.g., shared folder or web form)
   - Designate a person to process submissions and update leaderboard
   - Establish a clear process for cross-team validation of submissions
   - Update the leaderboard at regular intervals (every 10-15 minutes)

3. **During the Hackathon:**
   - Have technical helpers available for questions
   - Give time warnings at 15-minute intervals
   - Ensure teams understand the validation requirements
   - Regularly remind teams about continuous submission option

4. **Cross-Team Validation Management:**
   - Create and distribute team pairing assignments before the final sprint
   - Provide a standardized validation reporting form
   - Mediate any disputes between teams about solution validity
   - Collect validated results for leaderboard update

5. **Post-Hackathon:**
   - Share winning approaches with all teams
   - Consider publishing leaderboard and best solutions
   - Collect feedback for future iterations

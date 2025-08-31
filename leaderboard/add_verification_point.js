/**
 * Add Verification Points to Teams
 * 
 * This script allows adding 1 point to a team for verifying another team's solution.
 * 
 * Usage: node leaderboard/add_verification_point.js [team_name]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Constants
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboard.json');

/**
 * Read the leaderboard file
 * @returns {Object} The leaderboard data
 */
function readLeaderboard() {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    console.error(`Leaderboard file not found: ${LEADERBOARD_FILE}`);
    process.exit(1);
  }

  try {
    const leaderboardData = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    return JSON.parse(leaderboardData);
  } catch (error) {
    console.error(`Error reading leaderboard: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Write the updated leaderboard data to file
 * @param {Object} leaderboard - The leaderboard data
 */
function writeLeaderboard(leaderboard) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
    console.log('Leaderboard updated successfully!');
  } catch (error) {
    console.error(`Error writing leaderboard: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Add a verification point to a team
 * @param {string} teamName - The name of the team
 * @param {Object} leaderboard - The leaderboard data
 * @returns {boolean} Whether the operation was successful
 */
function addVerificationPoint(teamName, leaderboard) {
  // Find the team
  const teamIndex = leaderboard.teams.findIndex(team => 
    team.name.toLowerCase() === teamName.toLowerCase());
  
  if (teamIndex === -1) {
    console.error(`Team not found: ${teamName}`);
    return false;
  }
  
  // Add the verification point
  const team = leaderboard.teams[teamIndex];
  
  // Initialize verificationPoints if it doesn't exist
  if (!team.verificationPoints) {
    team.verificationPoints = 0;
  }
  
  // Add 1 point
  team.verificationPoints += 1;
  
  // Update total points
  const solutionPoints = team.totalSolved * 3;
  team.points = solutionPoints + team.verificationPoints;
  
  console.log(`Added 1 verification point to ${team.name}`);
  console.log(`${team.name} now has ${team.verificationPoints} verification points and ${team.points} total points`);
  
  // Update timestamp
  leaderboard.lastUpdated = new Date().toISOString();
  
  // Sort teams by points, then by total solved, then by average execution time
  leaderboard.teams.sort((a, b) => {
    // Sort by points (descending)
    const aPoints = (a.totalSolved * 3) + (a.verificationPoints || 0);
    const bPoints = (b.totalSolved * 3) + (b.verificationPoints || 0);
    
    if (bPoints !== aPoints) {
      return bPoints - aPoints;
    }
    
    // Then by mazes solved (descending)
    if (b.totalSolved !== a.totalSolved) {
      return b.totalSolved - a.totalSolved;
    }
    
    // Then by execution time (ascending)
    return a.averageExecutionTime - b.averageExecutionTime;
  });
  
  return true;
}

/**
 * Display a list of teams
 * @param {Object} leaderboard - The leaderboard data
 */
function displayTeams(leaderboard) {
  console.log('\nTeams:');
  console.log('---------------------');
  
  leaderboard.teams.forEach((team, index) => {
    const verificationPoints = team.verificationPoints || 0;
    const solutionPoints = team.totalSolved * 3;
    const totalPoints = solutionPoints + verificationPoints;
    
    console.log(`${index + 1}. ${team.name}`);
    console.log(`   Solutions: ${team.totalSolved} (${solutionPoints} points)`);
    console.log(`   Verification Points: ${verificationPoints}`);
    console.log(`   Total Points: ${totalPoints}`);
    console.log('---------------------');
  });
}

/**
 * Create an interactive CLI to select a team
 * @param {Object} leaderboard - The leaderboard data
 */
function selectTeamInteractive(leaderboard) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  displayTeams(leaderboard);
  
  rl.question('\nEnter the number or name of the team to add a verification point: ', (answer) => {
    let teamName;
    
    // Check if input is a number (team index)
    const teamIndex = parseInt(answer) - 1;
    if (!isNaN(teamIndex) && teamIndex >= 0 && teamIndex < leaderboard.teams.length) {
      teamName = leaderboard.teams[teamIndex].name;
    } else {
      // Assume input is a team name
      teamName = answer;
    }
    
    if (addVerificationPoint(teamName, leaderboard)) {
      writeLeaderboard(leaderboard);
    }
    
    rl.question('\nAdd another verification point? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.close();
        selectTeamInteractive(readLeaderboard());
      } else {
        rl.close();
      }
    });
  });
}

// Main function
function main() {
  const leaderboard = readLeaderboard();
  
  // Check if team name was provided as argument
  const teamName = process.argv[2];
  
  if (teamName) {
    // Add verification point to specified team
    if (addVerificationPoint(teamName, leaderboard)) {
      writeLeaderboard(leaderboard);
    }
  } else {
    // Interactive mode
    selectTeamInteractive(leaderboard);
  }
}

// Run the main function
main();

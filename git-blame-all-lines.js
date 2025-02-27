const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if inside a git repository
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: Not inside a git repository.');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.error('Usage: node git-blame-all-lines.js <filename>');
  process.exit(1);
}

const file = process.argv[2];
const fullPath = path.join(process.cwd(), file);

if (!fs.existsSync(fullPath)) {
  console.error('File does not exist:', fullPath);
  process.exit(1);
}

try {
  // Run git blame in porcelain mode for the entire file.
  const rawOutput = execSync(`git blame --line-porcelain "${fullPath}"`, { encoding: 'utf8' });
  console.log("Raw git blame output:", rawOutput); // Debug log to verify output
  const lines = rawOutput.split('\n');
  const result = [];
  let current = {};

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^[0-9a-f]{40}/.test(line)) {
      // Commit line: start new record. If there is an existing record, push it.
      if (Object.keys(current).length > 0) {
        result.push(current);
        current = {};
      }
      const [commitSha, origLineNum, finalLineNum] = line.split(' ');
      current.commitSha = commitSha;
      current.origLineNum = origLineNum;
      current.finalLineNum = finalLineNum;
    } else if (line.startsWith('author ')) {
      current.author = line.slice(7);
    } else if (line.startsWith('\t')) {
      // The actual content of the line.
      current.content = line.slice(1);
    }
  }
  // Push last record if exists.
  if (Object.keys(current).length > 0) {
    result.push(current);
  }

  if (result.length === 0) {
    console.log("No git blame data found. Ensure the file has been committed.");
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error('Error running git blame:', error.message);
  process.exit(1);
}

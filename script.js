import { initialize } from "launchdarkly-js-client-sdk";

const context = {
  kind: 'user',
  key: 'context-key-123abc',
};

const client = initialize('67bab894bffb5f0c01b78239', context, {});

async function captureErrorWithFlags(user, error) {
  const flags = await client.allFlagsState(user);
  captureError(user, error, 'broken-button');
}

function captureError(user, error, metricKey) {
  const errorData = {
    errorMessage: error.message,
    stackTrace: error.stack,
    timestamp: new Date().toISOString(),
    metricKey: metricKey, // Include the metric key
  };

  client.track(metricKey, {errorData})
  console.log('Error tracked with feature flags:', errorData);
}

const user = context;
const metricKey = 'broken-button';

// Example usage

document.getElementById('broken-btn').addEventListener('click', () => {
  try {
    // Code that might throw an error
    throw new Error('Button is broken!');
  } catch (error) {
    captureError(user, error, metricKey);
  }
})

client.waitForInitialization().then(() => {
  console.log('LaunchDarkly SDK initialized!');
}).catch((err) => {
  console.error('Failed to initialize LaunchDarkly SDK:', err);
});





const { execSync } = require('child_process');

/**
 * Get git blame data for a specific file and line number.
 * @param {string} filePath - Path to the file.
 * @param {number} lineNumber - Line number to blame.
 * @returns {Object} - An object containing commit SHA, author, and line content.
 */
function getGitBlameData(filePath, lineNumber) {
  try {
    // Run git blame with porcelain format
    const blameOutput = execSync(
      `git blame --line-porcelain -L ${lineNumber},${lineNumber} ${filePath}`
    ).toString();

    // Parse the porcelain format output
    const lines = blameOutput.split('\n');
    const commitSha = lines[0].split(' ')[0]; // First line contains the commit SHA
    const author = lines.find((line) => line.startsWith('author ')).split(' ')[1]; // Line starting with 'author '
    const lineContent = lines.find((line) => line.startsWith('\t')).trim(); // Line starting with a tab

    return {
      commitSha,
      author,
      lineContent,
    };
  } catch (error) {
    console.error('Error running git blame:', error.message);
    return null;
  }
}

// Example usage
const filePath = 'example.js'; // Replace with your file path
const lineNumber = 5; // Replace with the line number you want to blame

const blameData = getGitBlameData(filePath, lineNumber);

if (blameData) {
  console.log('Git Blame Data:', blameData);
} else {
  console.log('Failed to get git blame data.');
}
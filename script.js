// -- Initialization Section --
import { initialize } from "launchdarkly-js-client-sdk";

const context = { kind: 'user', key: 'context-key-123abc' };
const client = initialize('67bab894bffb5f0c01b78239', context, {});

// -- Error Handling Section --
async function captureErrorWithFlags(user, error) {
  const flags = await client.allFlagsState(user);
  captureError(user, error, 'broken-button');
}

function captureError(user, error, metricKey) {
  const errorData = {
    errorMessage: error.message,
    stackTrace: error.stack,
    timestamp: new Date().toISOString(),
    metricKey: metricKey
  };
  client.track(metricKey, { errorData });
  console.log('Error tracked with feature flags:', errorData);
}

// -- Data Fetching & Processing Section --
async function fetchGitBlameAllLines(filePath) {
  try {
    const url = `/api/git-blame-all-lines?filePath=${encodeURIComponent(filePath)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Fetched Git Blame Data:', data);
      return data;
    } catch (jsonError) {
      console.error(`JSON parse error: ${text}`);
      throw new Error(`Failed to parse JSON: ${text}`);
    }
  } catch (error) {
    console.error('Error fetching git blame data for all lines:', error);
    return null;
  }
}

function processBlameData(blameData) {
  // Group records by commit SHA into commit versions.
  const commitVersions = {};
  blameData.forEach(record => {
    const sha = record.commitSha;
    if (!commitVersions[sha]) {
      commitVersions[sha] = {
        commitName: record.commitName, // Provided by the server endpoint.
        lines: []
      };
    }
    commitVersions[sha].lines.push(record);
  });
  return commitVersions;
}

// -- Main Execution Section --
document.getElementById('broken-btn').addEventListener('click', () => {
  try {
    throw new Error('Button is broken!');
  } catch (error) {
    captureError(context, error, 'broken-button');
  }
});

client.waitForInitialization()
  .then(() => console.log('LaunchDarkly SDK initialized!'))
  .catch(err => console.error('Failed to initialize LaunchDarkly SDK:', err));

const filePath = 'script.js';
fetchGitBlameAllLines(filePath)
  .then(data => {
    if (data) {
      console.log('Full Blame Data:', data);
      const commitVersions = processBlameData(data);
      console.log('Commit Versions:', commitVersions);
      // Optionally update the UI with commit versions.
    }
  })
  .catch(error => {
    console.error('Error processing git blame data:', error);
  });


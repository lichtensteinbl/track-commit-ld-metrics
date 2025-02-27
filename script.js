// -- Initialization Section --
import { initialize } from "launchdarkly-js-client-sdk";

const context = { kind: 'user', key: 'placeholder' };
const client = initialize('CLIENT_SIDE_KEY', context, {});

// -- Helper Function: Fetch blame for a single line --
async function fetchGitBlameLine(filePath, lineNumber) {
  try {
    const url = `/api/git-blame-all-lines?filePath=${encodeURIComponent(filePath)}&lineNumber=${lineNumber}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Fetched blame data for line:', data);
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON: ${text}`);
      throw new Error(`Failed to parse JSON: ${text}`);
    }
  } catch (error) {
    console.error('Error fetching blame data for a single line:', error);
    return null;
  }
}


async function captureError(user, error, metricKey) {
  let blameData = null;
  // Use regex to extract file name and line number; matches pattern like "http://127.0.0.1:5137/script.js:100:15"
  const stackMatch = error.stack.match(/(\S+\.js):(\d+):\d+/);
  if (stackMatch) {
    let errorFile = stackMatch[1];
    // Extract only the file name (e.g., "script.js") if URL is included.
    errorFile = errorFile.split('/').pop();
    const errorLine = stackMatch[2];
    blameData = await fetchGitBlameLine(errorFile, errorLine);
  }
  
  const errorData = {
    errorMessage: error.message,
    stackTrace: error.stack,
    blameData: blameData // single-line blame data for the error line
  };
  
  client.track(metricKey, { errorData });
  console.log('Error tracked with feature flags:', errorData);
}

// -- Error Handling Section --
async function captureErrorWithFlags(user, error) {
  const flags = await client.allFlagsState(user);
  captureError(user, error, 'broken-button');
}

// Updated Error Handling Section with improved stack extraction




document.getElementById('broken-btn').addEventListener('click', () => {
  try {
    throw new Error('Button is broken!');
  } catch (error) {
    captureError(context, error, 'broken-button');
  }
});

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


  
import { initialize } from "launchdarkly-js-client-sdk";

const context = {
  kind: 'user',
  key: 'context-key-123abc'
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
    metricKey: metricKey
  };
  client.track(metricKey, { errorData });
  console.log('Error tracked with feature flags:', errorData);
}

// Function to fetch git blame data for all lines from the backend
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
      console.log('Git Blame Data for all lines:', data);
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON: ${text}`);
      throw new Error(`Failed to parse JSON: ${text}`);
    }
  } catch (error) {
    console.error('Error fetching git blame data for all lines:', error);
    return null;
  }
}

const user = context;
const metricKey = 'broken-button';

document.getElementById('broken-btn').addEventListener('click', () => {
  try {
    throw new Error('Button is broken!');
  } catch (error) {
    captureError(user, error, metricKey);
  }
});

client.waitForInitialization()
  .then(() => console.log('LaunchDarkly SDK initialized!'))
  .catch(err => console.error('Failed to initialize LaunchDarkly SDK:', err));

// Example usage
const filePath = 'script.js';
fetchGitBlameAllLines(filePath)
  .then(data => {
    if (data) console.log('Git Blame Data for all lines:', data);
  })
  .catch(error => {
    console.error('Error fetching git blame data for all lines:', error);
  });


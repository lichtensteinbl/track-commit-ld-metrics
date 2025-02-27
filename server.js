const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 2000;

// API endpoint for git blame data (must be defined before static middleware)
app.get('/api/git-blame-all-lines', (req, res) => {
  const { filePath } = req.query;
  const fullFilePath = path.join(process.cwd(), filePath);
  console.log('Requested file full path:', fullFilePath);

  if (!fs.existsSync(fullFilePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const rawOutput = execSync(`git blame --line-porcelain "${fullFilePath}"`, { encoding: 'utf8' });
    const lines = rawOutput.split('\n');
    const result = [];
    let current = {};
    
    for (const line of lines) {
      if (!line.trim()) continue;
      if (/^[0-9a-f]{40}/.test(line)) {
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
        current.content = line.slice(1);
      }
    }
    if (Object.keys(current).length > 0) {
      result.push(current);
    }
    
    // Get commit names using git show and cache them.
    const commitNames = {};
    result.forEach(record => {
      const sha = record.commitSha;
      if (!commitNames[sha]) {
        // Get the commit's subject (commit name)
        commitNames[sha] = execSync(`git show ${sha} --no-patch --pretty=format:%s`, { encoding: 'utf8' }).trim();
      }
      record.commitName = commitNames[sha];
    });

    if (result.length === 0) {
      res.json({ message: "No git blame data found. Ensure the file has been committed." });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error running git blame:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files afterward.
app.use(express.static(path.join(__dirname)));

// Favicon request.
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Main HTML page.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

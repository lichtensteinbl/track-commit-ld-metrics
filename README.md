# Suspect Commit Demo

This project demonstrates an application that integrates Git blame data with feature flag error tracking.

## Overview

- **Express API Backend**:  
  Provides an API endpoint `/api/git-blame-all-lines` that runs `git blame` on specified files. You can filter the blame data to retrieve results for a specific line number. If the commit SHA is invalid (all zeros), it marks the line as "Uncommitted".

- **Vite Dev Server**:  
  The project uses Vite (running on port 5137) with a proxy configured to forward API requests to the Express server on port 2000.

- **LaunchDarkly Integration**:  
  The app integrates with LaunchDarkly for feature flag management. When errors occur (e.g., via a broken button), it captures the error along with Git blame data (commit information for the line where the error occurred) and sends this data to LaunchDarkly.

## File Structure

- **server.js**:  
  Sets up an Express server with a Git blame API endpoint and serves static files, including the main HTML page.

- **script.js**:  
  Contains the client-side code for fetching Git blame data, processing it, and error tracking with LaunchDarkly.

- **vite.config.js**:  
  Configuration for the Vite dev server including proxy settings.

- **index.html**:  
  A simple HTML page with buttons to trigger errors and test functionality.

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   This command uses `concurrently` to start both the Express server (port 2000) and the Vite dev server (port 5137).

3. **Usage:**
   - Open your browser and navigate to `http://localhost:5137`.
   - Click the **broken button** to simulate an error. The error is captured along with the Git blame data for the specific line where the error occurred, then sent to LaunchDarkly.

## Notes

- Ensure that your files are committed in Git as uncommitted lines might be marked as "Uncommitted" by the blame data.
- You can customize the error tracking and Git blame processing further to meet specific requirements.

Happy coding!
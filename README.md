# Suspect-Commit Demo

This project shows how to suspect which commit is causing an error by sending git log data as part of a LD track event. 

## Setup

Follow these steps to set up and run the project:

1. **Install Dependencies**:
   ```sh
   npm install
   ```

2. **Run the Vite Development Server**:
   ```sh
   npm run dev
   ```

3. **Build for Production**:
   ```sh
   npm run build
   ```

## GitHub Actions

A CI workflow is configured under `.github/workflows/ci.yml` to install dependencies and run a build.
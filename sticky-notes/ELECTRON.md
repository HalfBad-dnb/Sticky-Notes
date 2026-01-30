# Electron Desktop App Setup

This document provides instructions for building and running the Sticky Notes desktop application using Electron.

## Auto-Updates

The app includes automatic update functionality using `electron-updater`. Users will be notified when updates are available and can download and install them with one click.

### How Updates Work

1. **Check for Updates**: App checks for updates on startup
2. **Download**: Updates are downloaded in the background
3. **Notify**: User sees a dialog when update is ready
4. **Install**: User chooses to restart and install the update

### Release Process

To publish an update:

1. Update the version in `package.json`
2. Create a GitHub release
3. Run the release command:

```bash
npm run release
```

This builds the app and publishes it to GitHub Releases with proper update metadata.

### Configuration

Update the `publish` section in `package.json`:

```json
{
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "sticky-notes"
  }
}
```

Replace `your-username` with your actual GitHub username.

## Overview

The Electron setup allows you to create cross-platform desktop applications for Mac, Windows, and Linux from your React web application.

## Prerequisites

- Node.js 20+ (recommended)
- npm or yarn
- Git
- GitHub repository for releases (for auto-updates)

## Installation

The required Electron packages are already installed:

- `electron` - Main Electron framework
- `electron-builder` - For packaging the app
- `electron-updater` - For automatic updates
- `concurrently` - For running multiple commands
- `wait-on` - For waiting for dev server

## Development

### Running in Development Mode

```bash
npm run electron-dev
```

This command:

1. Starts the Vite development server
2. Waits for it to be ready
3. Launches the Electron app
4. Opens DevTools automatically
5. Disables auto-updater (development only)

### Running Built App Locally

```bash
npm run electron
```

This runs the Electron app using the built files (requires running `npm run build` first).

## Building for Production

### Build for Current Platform

```bash
npm run electron-build
```

### Platform-Specific Builds

#### Mac (macOS)

```bash
npm run electron-build-mac
```

- Creates: `Sticky Notes.app`
- Location: `dist-electron/`
- Category: Productivity

#### Windows

```bash
npm run electron-build-win
```

- Creates: `Sticky Notes Setup.exe`
- Location: `dist-electron/`
- Target: NSIS installer

#### All Platforms

```bash
npm run electron-build-all
```

Builds for both Mac and Windows simultaneously.

### Publishing Updates

```bash
npm run release
```

This builds the app and publishes to GitHub Releases with update metadata.

## Build Output

All built applications are output to the `dist-electron/` directory, which is included in `.gitignore`.

### Mac Output

- `Sticky Notes.app` - The main application bundle
- `Sticky Notes-*.dmg` - Optional disk image (if configured)
- `*.yml` - Update metadata file

### Windows Output

- `Sticky Notes Setup.exe` - Installer
- `Sticky Notes-*.exe` - Portable executable
- `*.yml` - Update metadata file

### Linux Output

- `Sticky Notes.AppImage` - Portable AppImage
- `*.yml` - Update metadata file

## Configuration

### Main Process File

- Location: `public/electron.js`
- Entry point defined in `package.json` as `"main": "public/electron.js"`
- Includes auto-updater configuration and event handlers

### Build Configuration

Located in `package.json` under the `"build"` key:

```json
{
  "appId": "com.stickynotes.app",
  "productName": "Sticky Notes",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "public/electron.js"
  ],
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "sticky-notes"
  },
  "mac": {
    "category": "public.app-category.productivity"
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## Development Workflow

1. **Development**: Use `npm run electron-dev` for hot reloading
2. **Testing**: Build and test with `npm run electron-build`
3. **Version Bump**: Update version in `package.json`
4. **Release**: Use `npm run release` to publish updates
5. **Distribution**: Users get automatic updates from GitHub Releases

## Version Management

### Semantic Versioning

Use semantic versioning in `package.json`:

- `1.0.0` - Major release (breaking changes)
- `1.1.0` - Minor release (new features)
- `1.1.1` - Patch release (bug fixes)

### Release Process

1. Update version: `npm version patch/minor/major`
2. Commit changes
3. Run: `npm run release`
4. Create GitHub release (optional - electron-builder can do this)

## Environment Variables

- `NODE_ENV=development` - Enables DevTools and loads from Vite dev server
- `NODE_ENV=production` - Loads from built files and enables auto-updater

## Troubleshooting

### Common Issues

1. **Port Conflict**: Ensure port 5173 is available for Vite dev server
2. **Build Fails**: Make sure to run `npm run build` before `npm run electron`
3. **Memory Issues**: Increase Node.js memory limit if needed during builds
4. **Update Issues**: Check GitHub repository configuration and permissions

### Update Debugging

To debug update issues:

1. Check console logs for update events
2. Verify GitHub release has correct assets
3. Ensure `latest.yml`/`latest-mac.yml` files are generated
4. Test with `GH_TOKEN` environment variable for private repos

### Clean Build

To clean build artifacts:

```bash
rm -rf dist-electron/
rm -rf dist/
```

Then rebuild:

```bash
npm run build
npm run electron-build
```

## Additional Resources

- [Electron Documentation](https://electronjs.org/docs)
- [Electron Builder Documentation](https://electron.build/)
- [Electron Updater Documentation](https://www.electron.build/auto-update)
- [React + Electron Best Practices](https://electron-react-boilerplate.js.org/)

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run electron` | Run Electron app from built files |
| `npm run electron-dev` | Run in development mode with hot reload |
| `npm run electron-build` | Build for current platform |
| `npm run electron-build-mac` | Build for macOS |
| `npm run electron-build-win` | Build for Windows |
| `npm run electron-build-all` | Build for all platforms |
| `npm run release` | Build and publish to GitHub Releases |

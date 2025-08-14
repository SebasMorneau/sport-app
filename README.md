# SportApp - React Native

A simple React Native app for tracking sports activities and scores.

## Prerequisites

- Node.js (version 18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android Emulator
1. Start Android Studio and launch an Android Virtual Device (AVD)
2. Run the app:
```bash
npm run android
```

### iOS Simulator (macOS only)
1. Run the app:
```bash
npm run ios
```

## Development

To start the Metro bundler separately:
```bash
npm start
```

## Features

- Simple score tracking interface
- Add/remove points
- Reset functionality
- Clean, modern UI design

## Project Structure

- `App.tsx` - Main application component
- `android/` - Android-specific configuration
- `ios/` - iOS-specific configuration
- `index.js` - App entry point
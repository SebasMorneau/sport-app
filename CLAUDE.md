# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SportApp is a React Native application for tracking sports activities and scores. The app uses TypeScript and follows standard React Native project structure with both iOS and Android platform support.

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# iOS only - install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Running the Application
```bash
# Start Metro bundler
npm start

# Run on Android (ensure emulator is running first)
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Run Jest tests
npm test
```

## Architecture

### Technology Stack
- **React Native**: 0.72.4
- **React**: 18.2.0
- **TypeScript**: 4.8.4
- **Testing**: Jest with React Native preset
- **Linting**: ESLint with React Native configuration

### Key Files and Structure
- `App.tsx`: Main application component containing the score tracking UI and state management
- `index.js`: Application entry point that registers the main App component
- `metro.config.js`: Metro bundler configuration
- `babel.config.js`: Babel transpiler configuration using metro-react-native-babel-preset

### Platform-Specific Code
- `android/`: Contains Android-specific configuration including Gradle build files, MainActivity.java, and resources
- `ios/`: Contains iOS-specific configuration including Xcode project files, AppDelegate, and Podfile

### Current App Features
The app currently implements a simple score tracking system with:
- Score display card with current value
- Add point functionality
- Reset score functionality
- Modern UI with blue (#4285f4) and red (#ea4335) color scheme

## Important Patterns

### State Management
Currently uses React's built-in useState hook for local state management. The main score state is managed in App.tsx.

### Styling
Uses React Native's StyleSheet.create() for component styling with a consistent design system featuring:
- Card-based layouts with shadow effects
- Consistent color palette
- Responsive button designs

### Component Structure
The app follows a single-component architecture with App.tsx containing all UI and logic. Future development should consider component extraction for reusability.
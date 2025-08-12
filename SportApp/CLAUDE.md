# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Structure

This is a React Native fitness/sports app with a monolithic architecture consisting of:

- **SportApp/** - Main React Native application
- **server/** - Backend API server (minimal structure, likely placeholder)

## Development Commands

### Core Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Lint code
npm run lint

# Validate project
npm run validate
```

### Build Commands

```bash
# Android builds
npm run build:android              # Release APK
npm run build:android:bundle      # Release AAB

# iOS build
npm run build:ios                 # Xcode archive

# Clean builds
npm run clean                     # React Native clean
npm run clean:android            # Gradle clean
npm run clean:ios               # Xcode clean
```

### Post-install

```bash
npm run postinstall              # Automatically runs `cd ios && pod install`
```

## Architecture Overview

### State Management

- **Redux Toolkit** with **RTK Query** for API calls and caching
- **Redux Persist** for offline data persistence using AsyncStorage
- **Store Structure**:
  - API slices: authApi, exerciseApi, trainingApi, programApi, progressApi, nutritionApi, socialApi,
    aiApi, wearableApi, syncApi
  - State slices: auth, ui, offline, workout
  - Persisted slices: auth, offline, ui (theme preferences)

### Navigation

- **React Navigation v6** with nested navigators:
  - Stack Navigator for auth flow (Login/Register)
  - Bottom Tab Navigator for main app (Home, Workouts, Exercises, Nutrition, Progress, Profile)
  - Material Top Tabs for Progress section
- **Enhanced Components**: AnimatedTabBar, FloatingActionButton
- **Theme Integration**: Navigation headers respect theme colors

### API Configuration

- **Base URL Configuration**:
  - Development: `http://localhost:3500/api` (iOS) / `http://10.0.2.2:3500/api` (Android)
  - Production: Set via `API_URL` or `REACT_APP_API_URL` environment variable
- **Authentication**: Bearer token automatically injected into headers
- **Auto-reauthentication**: 401 responses trigger automatic logout
- **RTK Query Tags**: Comprehensive caching strategy with 15+ entity types

### Key Features

- **Offline Support**: Network state monitoring and offline data queueing
- **Theme System**: Light/dark mode with ThemeProvider context
- **Authentication Flow**: Persistent login with secure token storage
- **Component Architecture**:
  - Reusable UI components in `src/components/ui/`
  - Feature-specific components in `src/components/{feature}/`
  - Screen components in `src/screens/`

### Dependencies

- **Navigation**: @react-navigation/\* (v6)
- **State**: @reduxjs/toolkit, react-redux, redux-persist
- **UI**: react-native-gesture-handler, react-native-vector-icons, react-native-linear-gradient
- **Storage**: @react-native-async-storage/async-storage, react-native-keychain
- **Charts**: react-native-chart-kit
- **Permissions**: react-native-permissions
- **Device**: react-native-device-info, @react-native-community/netinfo

## File Organization

```
src/
├── components/          # Reusable components
│   ├── ui/             # Generic UI components
│   ├── navigation/     # Navigation-specific components
│   ├── dashboard/      # Dashboard widgets
│   └── gamification/   # Achievement system
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── store/              # Redux store setup
│   ├── api/           # RTK Query API definitions
│   └── slices/        # Redux state slices
├── theme/             # Theme system
├── config/            # App configuration
└── types/             # TypeScript type definitions
```

## Environment Requirements

- **Node**: >=18
- **React Native**: 0.74.0
- **TypeScript**: 5.0.4

## Development Notes

- Uses React Native CLI (not Expo managed workflow)
- Metro bundler configuration in `metro.config.js`
- Android: Uses Kotlin for native modules
- iOS: CocoaPods for dependency management
- TypeScript strict mode enabled

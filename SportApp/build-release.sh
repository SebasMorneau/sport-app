#!/bin/bash

echo "🚀 Building SportApp Release (No Metro Required)"

# Set Java environment
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Clean build
echo "🧹 Cleaning previous build..."
cd android
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Install on emulator
echo "📱 Installing on emulator..."
cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk

echo "✅ SportApp release build complete!"
echo "📱 App installed on emulator"
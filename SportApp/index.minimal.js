/**
 * @format
 */

// Minimal polyfill
if (typeof global === 'undefined') {
  global = this || {};
}

import { AppRegistry } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { name as appName } from './app.json';

const MinimalApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ SportApp Working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

AppRegistry.registerComponent(appName, () => MinimalApp);

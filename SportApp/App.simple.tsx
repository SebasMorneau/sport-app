import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Color constants
const COLORS = {
  background: '#f0f0f0',
  text: '#333',
  subtext: '#666',
} as const;

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 SportApp is Running!</Text>
      <Text style={styles.subtext}>Basic React Native setup is working</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: COLORS.subtext,
  },
});

export default App;

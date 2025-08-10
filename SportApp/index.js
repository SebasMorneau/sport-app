/**
 * @format
 */

// Minimal polyfill
if (typeof global === 'undefined') {
  global = this || {};
}

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

AppRegistry.registerComponent(appName, () => App);

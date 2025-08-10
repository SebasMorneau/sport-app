const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Use default Watchman-based watcher (do not override to Node watcher)
  // and exclude nested example projects from resolution to reduce churn
  resolver: {
    blockList: exclusionList([/android\/(SportAppExpo)\/.*$/]),
  },
  server: {
    // Reduce concurrent connections
    enhanceMiddleware: middleware => {
      return (req, res, next) => {
        res.setHeader('Connection', 'close');
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

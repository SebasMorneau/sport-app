const http = require('http');
const fs = require('fs');

// Create a simple bundle content
const bundle = `
// Simple React Native bundle
var __DEV__ = true;
var process = { env: { NODE_ENV: 'development' } };
if (typeof global === 'undefined') {
  global = this || {};
}

// Mock React Native
var ReactNative = {
  AppRegistry: {
    registerComponent: function(name, getComponent) {
      console.log('Registering component:', name);
      // Simulate app startup
      setTimeout(() => {
        try {
          const App = getComponent();
          console.log('App component created');
        } catch (e) {
          console.error('App error:', e);
        }
      }, 100);
    },
    runApplication: function() {}
  },
  View: function(props) { return props.children; },
  Text: function(props) { return props.children; },
  StyleSheet: {
    create: function(styles) { return styles; }
  }
};

// Load the actual app
${fs
  .readFileSync('index.js', 'utf8')
  .replace(/import.*from.*;/g, '// Import removed')}
`;

const server = http.createServer((req, res) => {
  console.log('Request:', req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');

  if (req.url.includes('/status')) {
    res.end('packager-status:running');
  } else if (req.url.includes('index.bundle')) {
    res.end(bundle);
  } else {
    res.end('OK');
  }
});

server.listen(8081, '0.0.0.0', () => {
  console.log('Simple Metro server running on port 8081');
});

// Jest setup for Bitmovin tracker tests with shared mock augmentation

// Import the shared mock to extend it if needed
const nrvideo = require('@newrelic/video-core');

// Ensure all Log methods are available as Jest mocks
if (!nrvideo.Log.debug) nrvideo.Log.debug = jest.fn();
if (!nrvideo.Log.warn) nrvideo.Log.warn = jest.fn();
if (!nrvideo.Log.info) nrvideo.Log.info = jest.fn();
if (!nrvideo.Log.error) nrvideo.Log.error = jest.fn();
// Replace the existing method with a Jest spy
nrvideo.Log.debugCommonVideoEvents = jest.fn();

// Ensure Core.addTracker is a proper jest mock
if (!nrvideo.Core) nrvideo.Core = {};
if (!jest.isMockFunction(nrvideo.Core.addTracker)) {
  nrvideo.Core.addTracker = jest.fn();
}

// Ensure Constants.AdPositions is available
if (!nrvideo.Constants) {
  nrvideo.Constants = {};
}
if (!nrvideo.Constants.AdPositions) {
  nrvideo.Constants.AdPositions = {
    PRE: 'pre',
    MID: 'mid',
    POST: 'post'
  };
}

// Augment VideoTracker prototype with Jest spy methods
// This ensures all tracker instances have Jest-compatible mock methods
const originalVideoTracker = nrvideo.VideoTracker;

// Override the VideoTracker constructor to add Jest spies
nrvideo.VideoTracker = class VideoTracker extends originalVideoTracker {
  constructor(player, options) {
    super(player, options);

    // Initialize state object for tracker
    this.state = {
      isSeeking: false
    };

    // Add Jest spy methods to the instance
    const mockMethods = [
      'sendDownload', 'sendPlayerReady', 'sendRequest', 'sendResume', 'sendStart',
      'sendPause', 'sendEnd', 'sendError', 'sendSeekStart', 'sendSeekEnd',
      'sendBufferStart', 'sendBufferEnd', 'sendRenditionChanged', 'sendAdBreakStart',
      'sendAdBreakEnd', 'sendAdClick', 'sendAdQuartile', 'setAdsTracker'
    ];

    mockMethods.forEach(method => {
      if (typeof super[method] === 'function') {
        this[method] = jest.fn(super[method].bind(this));
      } else {
        this[method] = jest.fn();
      }
    });
  }
};

// Mock package.json for version testing
jest.mock('./package.json', () => ({
  version: '4.0.0',
  name: '@newrelic/video-bitmovin'
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

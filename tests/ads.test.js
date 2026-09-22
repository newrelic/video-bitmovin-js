import { BitmovinAdTracker } from '../src/ads';

// Mock the version import
jest.mock('../package.json', () => ({
  version: '4.0.0'
}));

describe('BitmovinAdTracker', () => {
  let mockPlayer;
  let adTracker;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a comprehensive mock player object
    mockPlayer = {
      on: jest.fn(),
      off: jest.fn(),
      ads: {
        getActiveAdBreak: jest.fn(() => ({
          position: 'pre'
        }))
      }
    };

    adTracker = new BitmovinAdTracker(mockPlayer);
  });

  describe('Constructor', () => {
    test('should initialize ad tracker with player', () => {
      expect(adTracker.player).toBe(mockPlayer);
    });

    test('should call parent VideoTracker constructor', () => {
      // The mock VideoTracker constructor should have been called
      expect(adTracker.sendRequest).toBeDefined();
      expect(adTracker.sendStart).toBeDefined();
      expect(adTracker.sendEnd).toBeDefined();
    });
  });

  describe('Tracker Information Methods', () => {
    test('getTrackerName should return "bitmovin-ads"', () => {
      expect(adTracker.getTrackerName()).toBe('bitmovin-ads');
    });

    test('getTrackerVersion should return version from package.json', () => {
      expect(adTracker.getTrackerVersion()).toBe('4.0.0');
    });
  });

  describe('Event Listener Registration', () => {
    test('should register all ad event listeners', () => {
      adTracker.registerListeners();

      // Check that all ad event listeners are registered
      expect(mockPlayer.on).toHaveBeenCalledWith('adbreakstarted', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adbreakfinished', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adstarted', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adfinished', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adskipped', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adclicked', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('adquartile', expect.any(Function));
      expect(mockPlayer.on).toHaveBeenCalledWith('aderror', expect.any(Function));

      // Verify the correct number of event registrations
      expect(mockPlayer.on).toHaveBeenCalledTimes(8);
    });

    test('should verify event listeners are bound correctly', () => {
      adTracker.registerListeners();

      // Get the function arguments to verify binding
      const calls = mockPlayer.on.mock.calls;
      const adBreakStartedCall = calls.find(call => call[0] === 'adbreakstarted');
      const adBreakFinishedCall = calls.find(call => call[0] === 'adbreakfinished');
      const adStartedCall = calls.find(call => call[0] === 'adstarted');
      const adFinishedCall = calls.find(call => call[0] === 'adfinished');
      const adSkippedCall = calls.find(call => call[0] === 'adskipped');
      const adClickedCall = calls.find(call => call[0] === 'adclicked');
      const adQuartileCall = calls.find(call => call[0] === 'adquartile');
      const adErrorCall = calls.find(call => call[0] === 'aderror');

      expect(adBreakStartedCall[1]).toBeInstanceOf(Function);
      expect(adBreakFinishedCall[1]).toBeInstanceOf(Function);
      expect(adStartedCall[1]).toBeInstanceOf(Function);
      expect(adFinishedCall[1]).toBeInstanceOf(Function);
      expect(adSkippedCall[1]).toBeInstanceOf(Function);
      expect(adClickedCall[1]).toBeInstanceOf(Function);
      expect(adQuartileCall[1]).toBeInstanceOf(Function);
      expect(adErrorCall[1]).toBeInstanceOf(Function);
    });

    test('should unregister all ad event listeners', () => {
      adTracker.unregisterListeners();

      expect(mockPlayer.off).toHaveBeenCalledWith('adbreakstarted', adTracker.onAdBreakStarted);
      expect(mockPlayer.off).toHaveBeenCalledWith('adbreakfinished', adTracker.onAdBreakFinished);
      expect(mockPlayer.off).toHaveBeenCalledWith('adstarted', adTracker.onAdStarted);
      expect(mockPlayer.off).toHaveBeenCalledWith('adfinished', adTracker.onAdFinished);
      expect(mockPlayer.off).toHaveBeenCalledWith('adskipped', adTracker.onAdSkipped);
      expect(mockPlayer.off).toHaveBeenCalledWith('adclicked', adTracker.onAdClicked);
      expect(mockPlayer.off).toHaveBeenCalledWith('adquartile', adTracker.onAdQuartile);
      expect(mockPlayer.off).toHaveBeenCalledWith('aderror', adTracker.onAdError);

      // Verify the correct number of event unregistrations
      expect(mockPlayer.off).toHaveBeenCalledTimes(8);
    });
  });

  describe('Ad Event Handler Methods', () => {
    test('onAdBreakStarted should call sendAdBreakStart', () => {
      const event = { type: 'adbreakstarted' };
      adTracker.onAdBreakStarted(event);
      expect(adTracker.sendAdBreakStart).toHaveBeenCalled();
    });

    test('onAdBreakFinished should call sendAdBreakEnd', () => {
      const event = { type: 'adbreakfinished' };
      adTracker.onAdBreakFinished(event);
      expect(adTracker.sendAdBreakEnd).toHaveBeenCalled();
    });

    test('onAdStarted should call sendRequest and sendStart', () => {
      const event = { type: 'adstarted' };
      adTracker.onAdStarted(event);
      expect(adTracker.sendRequest).toHaveBeenCalled();
      expect(adTracker.sendStart).toHaveBeenCalled();
    });

    test('onAdSkipped should call sendEnd with skipped flag', () => {
      adTracker.onAdSkipped();
      expect(adTracker.sendEnd).toHaveBeenCalledWith({ skipped: true });
    });

    test('onAdFinished should call sendEnd', () => {
      adTracker.onAdFinished();
      expect(adTracker.sendEnd).toHaveBeenCalled();
    });

    test('onAdClicked should call sendAdClick with clickthrough URL', () => {
      const event = { clickThroughUrl: 'https://example.com/ad-click' };
      adTracker.onAdClicked(event);
      expect(adTracker.sendAdClick).toHaveBeenCalledWith({ url: 'https://example.com/ad-click' });
    });

    test('onAdClicked should handle missing clickthrough URL', () => {
      const event = {};
      adTracker.onAdClicked(event);
      expect(adTracker.sendAdClick).toHaveBeenCalledWith({ url: undefined });
    });

    test('onAdError should call sendError with error details', () => {
      const event = {
        code: 5001,
        message: 'Ad loading failed'
      };
      adTracker.onAdError(event);
      expect(adTracker.sendError).toHaveBeenCalledWith({
        errorCode: 5001,
        errorMessage: 'Ad loading failed'
      });
    });

    test('onAdError should handle missing error properties', () => {
      const event = {};
      adTracker.onAdError(event);
      expect(adTracker.sendError).toHaveBeenCalledWith({
        errorCode: undefined,
        errorMessage: undefined
      });
    });
  });

  describe('Ad Quartile Handling', () => {
    test('onAdQuartile should handle "firstQuartile" event', () => {
      const event = { quartile: 'firstQuartile' };
      adTracker.onAdQuartile(event);
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 1 });
    });

    test('onAdQuartile should handle "midpoint" event', () => {
      const event = { quartile: 'midpoint' };
      adTracker.onAdQuartile(event);
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 2 });
    });

    test('onAdQuartile should handle "thirdQuartile" event', () => {
      const event = { quartile: 'thirdQuartile' };
      adTracker.onAdQuartile(event);
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 3 });
    });

    test('onAdQuartile should handle unknown quartile with default value', () => {
      const event = { quartile: 'unknownQuartile' };
      adTracker.onAdQuartile(event);
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 0 });
    });

    test('onAdQuartile should handle missing quartile property', () => {
      const event = {};
      adTracker.onAdQuartile(event);
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 0 });
    });

    test('onAdQuartile should handle all quartile values in a comprehensive test', () => {
      const testCases = [
        { input: 'firstQuartile', expected: 1 },
        { input: 'midpoint', expected: 2 },
        { input: 'thirdQuartile', expected: 3 },
        { input: 'start', expected: 0 },
        { input: undefined, expected: 0 },
        { input: null, expected: 0 }
      ];

      testCases.forEach(({ input, expected }) => {
        jest.clearAllMocks();
        const event = input !== undefined ? { quartile: input } : {};
        adTracker.onAdQuartile(event);
        expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: expected });
      });
    });
  });

  describe('Method Binding and Context', () => {
    test('all event handler methods should be properly accessible', () => {
      expect(typeof adTracker.onAdBreakStarted).toBe('function');
      expect(typeof adTracker.onAdBreakFinished).toBe('function');
      expect(typeof adTracker.onAdStarted).toBe('function');
      expect(typeof adTracker.onAdFinished).toBe('function');
      expect(typeof adTracker.onAdSkipped).toBe('function');
      expect(typeof adTracker.onAdClicked).toBe('function');
      expect(typeof adTracker.onAdQuartile).toBe('function');
      expect(typeof adTracker.onAdError).toBe('function');
    });

    test('event handlers should maintain proper context when called', () => {
      // Test that methods work correctly when called with proper context
      adTracker.onAdStarted({ type: 'adstarted' });
      expect(adTracker.sendRequest).toHaveBeenCalled();
      expect(adTracker.sendStart).toHaveBeenCalled();

      jest.clearAllMocks();

      adTracker.onAdFinished();
      expect(adTracker.sendEnd).toHaveBeenCalled();

      jest.clearAllMocks();

      adTracker.onAdSkipped();
      expect(adTracker.sendEnd).toHaveBeenCalledWith({ skipped: true });
    });
  });

  describe('Integration with registerListeners/unregisterListeners', () => {
    test('should register listeners and handle events end-to-end', () => {
      // Register listeners
      adTracker.registerListeners();

      // Find the registered callback functions
      const calls = mockPlayer.on.mock.calls;
      const adStartedCallback = calls.find(call => call[0] === 'adstarted')[1];
      const adFinishedCallback = calls.find(call => call[0] === 'adfinished')[1];
      const adQuartileCallback = calls.find(call => call[0] === 'adquartile')[1];

      // Simulate events by calling the callbacks
      adStartedCallback({ type: 'adstarted' });
      expect(adTracker.sendRequest).toHaveBeenCalled();
      expect(adTracker.sendStart).toHaveBeenCalled();

      jest.clearAllMocks();

      adFinishedCallback();
      expect(adTracker.sendEnd).toHaveBeenCalled();

      jest.clearAllMocks();

      adQuartileCallback({ quartile: 'midpoint' });
      expect(adTracker.sendAdQuartile).toHaveBeenCalledWith({ quartile: 2 });
    });
  });
});
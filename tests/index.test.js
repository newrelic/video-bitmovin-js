import nrvideo from '@newrelic/video-core'
import TrackerClass from '../src/tracker';

const exportedModule = require("../src/index");

describe('Index Entry Point', () => {
  test('should assign TrackerClass to nrvideo.BitmovinTracker', () => {
    expect(nrvideo.BitmovinTracker).toBe(TrackerClass);
  });

  test('should export the modified nrvideo object', () => {
    expect(exportedModule).toBe(nrvideo);
  });

  test('should be able to create new instance', () => {
    const mockPlayer = {
      getCurrentTime: jest.fn(),
      getDuration: jest.fn(),
      isLive: jest.fn(),
      getVideoQuality: jest.fn(),
      getSource: jest.fn(),
      getStreamType: jest.fn(),
      version: '8.0.0',
      isMuted: jest.fn(),
      getPlaybackSpeed: jest.fn(),
      getConfig: jest.fn(),
      getAudio: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };

    const options = {
      licenseKey: 'test-key',
      accountId: 'test-account'
    };

    const tracker = new nrvideo.BitmovinTracker(mockPlayer, options);
    expect(tracker).toBeInstanceOf(TrackerClass);
    expect(tracker.getTrackerName()).toBe('bitmovin');
  });

  test('should maintain proper prototype chain', () => {
    expect(nrvideo.BitmovinTracker.prototype.getTrackerName).toBeDefined();
    expect(nrvideo.BitmovinTracker.prototype.registerListeners).toBeDefined();
    expect(nrvideo.BitmovinTracker.prototype.unregisterListeners).toBeDefined();
  });
});
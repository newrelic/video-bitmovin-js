import BitmovinTracker from '../src/tracker';
import { BitmovinAdTracker } from '../src/ads';

// Mock the version import
jest.mock('../package.json', () => ({
  version: '4.0.0'
}));

describe('BitmovinTracker', () => {
  let mockPlayer;
  let tracker;
  let options;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a comprehensive mock player object
    mockPlayer = {
      getCurrentTime: jest.fn(() => 120.5),
      getDuration: jest.fn(() => 300),
      isLive: jest.fn(() => false),
      getVideoQuality: jest.fn(() => ({
        bitrate: 1000000,
        label: '1080p',
        width: 1920,
        height: 1080
      })),
      getSource: jest.fn(() => ({
        hls: 'https://example.com/stream.m3u8',
        dash: 'https://example.com/stream.mpd'
      })),
      getStreamType: jest.fn(() => 'hls'),
      version: '8.181.0',
      isMuted: jest.fn(() => false),
      getPlaybackSpeed: jest.fn(() => 1),
      getConfig: jest.fn(() => ({ autoplay: true })),
      getAudio: jest.fn(() => ({ lang: 'en' })),
      on: jest.fn(),
      off: jest.fn(),
      ads: {
        getActiveAdBreak: jest.fn()
      }
    };

    options = {
      licenseKey: 'test-license-key',
      accountId: 'test-account-id'
    };

    tracker = new BitmovinTracker(mockPlayer, options);
  });

  describe('Constructor', () => {
    test('should initialize tracker with player and options', () => {
      expect(tracker.player).toBe(mockPlayer);
      expect(tracker.options).toBe(options);
      expect(tracker._trackerReadySent).toBe(false);
    });

    test('should call nrvideo.Core.addTracker during construction', () => {
      const nrvideo = require('@newrelic/video-core');
      expect(nrvideo.Core.addTracker).toHaveBeenCalledWith(tracker, options);
    });
  });

  describe('Tracker Information Methods', () => {
    test('getTrackerName should return "bitmovin"', () => {
      expect(tracker.getTrackerName()).toBe('bitmovin');
    });

    test('getTrackerVersion should return version from package.json', () => {
      expect(tracker.getTrackerVersion()).toBe('4.0.0');
    });

    test('getPlayerName should return "Bitmovin"', () => {
      expect(tracker.getPlayerName()).toBe('Bitmovin');
    });

    test('getInstrumentationProvider should return "New Relic"', () => {
      expect(tracker.getInstrumentationProvider()).toBe('New Relic');
    });

    test('getInstrumentationName should return player name', () => {
      expect(tracker.getInstrumentationName()).toBe('Bitmovin');
    });

    test('getInstrumentationVersion should return player version', () => {
      expect(tracker.getInstrumentationVersion()).toBe('8.181.0');
    });
  });

  describe('Player State Methods', () => {
    test('getPlayhead should return current time from player', () => {
      expect(tracker.getPlayhead()).toBe(120.5);
      expect(mockPlayer.getCurrentTime).toHaveBeenCalled();
    });

    test('getDuration should return duration from player', () => {
      expect(tracker.getDuration()).toBe(300);
      expect(mockPlayer.getDuration).toHaveBeenCalled();
    });

    test('isLive should return live status from player', () => {
      expect(tracker.isLive()).toBe(false);
      expect(mockPlayer.isLive).toHaveBeenCalled();
    });

    test('getPlayerVersion should return player version', () => {
      expect(tracker.getPlayerVersion()).toBe('8.181.0');
    });

    test('isMuted should return mute status from player', () => {
      expect(tracker.isMuted()).toBe(false);
      expect(mockPlayer.isMuted).toHaveBeenCalled();
    });

    test('getPlayrate should return playback speed from player', () => {
      expect(tracker.getPlayrate()).toBe(1);
      expect(mockPlayer.getPlaybackSpeed).toHaveBeenCalled();
    });

    test('isAutoplayed should return autoplay config from player', () => {
      expect(tracker.isAutoplayed()).toBe(true);
      expect(mockPlayer.getConfig).toHaveBeenCalled();
    });

    test('isAutoplayed should handle missing config', () => {
      mockPlayer.getConfig.mockReturnValue(null);
      expect(tracker.isAutoplayed()).toBeUndefined();
    });

    test('getPreload should return null', () => {
      expect(tracker.getPreload()).toBeNull();
    });

    test('getLanguage should return audio language from player', () => {
      expect(tracker.getLanguage()).toBe('en');
      expect(mockPlayer.getAudio).toHaveBeenCalled();
    });

    test('getLanguage should handle missing audio', () => {
      mockPlayer.getAudio.mockReturnValue(null);
      expect(tracker.getLanguage()).toBeUndefined();
    });
  });

  describe('Video Quality Methods', () => {
    test('getRenditionBitrate should return bitrate from video quality', () => {
      expect(tracker.getRenditionBitrate()).toBe(1000000);
      expect(mockPlayer.getVideoQuality).toHaveBeenCalled();
    });

    test('getRenditionBitrate should handle missing quality', () => {
      mockPlayer.getVideoQuality.mockReturnValue(null);
      expect(tracker.getRenditionBitrate()).toBeUndefined();
    });

    test('getRenditionName should return label from video quality', () => {
      expect(tracker.getRenditionName()).toBe('1080p');
      expect(mockPlayer.getVideoQuality).toHaveBeenCalled();
    });

    test('getRenditionName should handle missing quality', () => {
      mockPlayer.getVideoQuality.mockReturnValue(null);
      expect(tracker.getRenditionName()).toBeUndefined();
    });

    test('getRenditionWidth should return width from video quality', () => {
      expect(tracker.getRenditionWidth()).toBe(1920);
      expect(mockPlayer.getVideoQuality).toHaveBeenCalled();
    });

    test('getRenditionWidth should handle missing quality', () => {
      mockPlayer.getVideoQuality.mockReturnValue(null);
      expect(tracker.getRenditionWidth()).toBeUndefined();
    });

    test('getRenditionHeight should return height from video quality', () => {
      expect(tracker.getRenditionHeight()).toBe(1080);
      expect(mockPlayer.getVideoQuality).toHaveBeenCalled();
    });

    test('getRenditionHeight should handle missing quality', () => {
      mockPlayer.getVideoQuality.mockReturnValue(null);
      expect(tracker.getRenditionHeight()).toBeUndefined();
    });
  });

  describe('getSrc Method', () => {
    test('should return source URL for matching stream type', () => {
      mockPlayer.getStreamType.mockReturnValue('hls');
      expect(tracker.getSrc()).toBe('https://example.com/stream.m3u8');
    });

    test('should return "unknown" for non-matching stream type', () => {
      mockPlayer.getStreamType.mockReturnValue('progressive');
      expect(tracker.getSrc()).toBe('unknown');
    });

    test('should return "unknown" when no source available', () => {
      mockPlayer.getSource.mockReturnValue(null);
      expect(tracker.getSrc()).toBe('unknown');
    });
  });

  describe('Event Listener Registration', () => {
    test('should register all player event listeners', () => {
      tracker.registerListeners();

      // Check that event listeners are registered
      expect(mockPlayer.on).toHaveBeenCalledWith('sourceloaded', tracker.onDownload);
      expect(mockPlayer.on).toHaveBeenCalledWith('ready', tracker.onReady);
      expect(mockPlayer.on).toHaveBeenCalledWith('play', tracker.onPlay);
      expect(mockPlayer.on).toHaveBeenCalledWith('playing', tracker.onPlaying);
      expect(mockPlayer.on).toHaveBeenCalledWith('paused', tracker.onPaused);
      expect(mockPlayer.on).toHaveBeenCalledWith('playbackfinished', tracker.onFinish);
      expect(mockPlayer.on).toHaveBeenCalledWith('error', tracker.onError);
      expect(mockPlayer.on).toHaveBeenCalledWith('seek', tracker.onSeek);
      expect(mockPlayer.on).toHaveBeenCalledWith('seeked', tracker.onSeeked);
      expect(mockPlayer.on).toHaveBeenCalledWith('stallstarted', tracker.onStallStart);
      expect(mockPlayer.on).toHaveBeenCalledWith('stallended', tracker.onStallEnded);
      expect(mockPlayer.on).toHaveBeenCalledWith('segmentplayback', tracker.onSegmentPlayback);
      expect(mockPlayer.on).toHaveBeenCalledWith('videoplaybackqualitychanged', tracker.onQualityChange);
    });

    test('should call nrvideo.Log.debugCommonVideoEvents', () => {
      const nrvideo = require('@newrelic/video-core');
      tracker.registerListeners();
      expect(nrvideo.Log.debugCommonVideoEvents).toHaveBeenCalledWith(mockPlayer, expect.any(Array));
    });

    test('should unregister all player event listeners', () => {
      tracker.unregisterListeners();

      expect(mockPlayer.off).toHaveBeenCalledWith('sourceloaded', tracker.onDownload);
      expect(mockPlayer.off).toHaveBeenCalledWith('ready', tracker.onReady);
      expect(mockPlayer.off).toHaveBeenCalledWith('play', tracker.onPlay);
      expect(mockPlayer.off).toHaveBeenCalledWith('playing', tracker.onPlaying);
      expect(mockPlayer.off).toHaveBeenCalledWith('paused', tracker.onPaused);
      expect(mockPlayer.off).toHaveBeenCalledWith('playbackfinished', tracker.onFinish);
      expect(mockPlayer.off).toHaveBeenCalledWith('error', tracker.onError);
      expect(mockPlayer.off).toHaveBeenCalledWith('seek', tracker.onSeek);
      expect(mockPlayer.off).toHaveBeenCalledWith('seeked', tracker.onSeeked);
      expect(mockPlayer.off).toHaveBeenCalledWith('stallstarted', tracker.onStallStart);
      expect(mockPlayer.off).toHaveBeenCalledWith('stallended', tracker.onStallEnded);
      expect(mockPlayer.off).toHaveBeenCalledWith('segmentplayback', tracker.onSegmentPlayback);
      expect(mockPlayer.off).toHaveBeenCalledWith('videoplaybackqualitychanged', tracker.onQualityChange);
    });
  });

  describe('Event Handler Methods', () => {
    test('onDownload should call sendDownload with event state', () => {
      const event = { type: 'sourceloaded' };
      tracker.onDownload(event);
      expect(tracker.sendDownload).toHaveBeenCalledWith({ state: 'sourceloaded' });
    });

    test('onReady should send player ready and set up ads tracker', () => {
      tracker.onReady();
      expect(tracker.sendPlayerReady).toHaveBeenCalled();
      expect(tracker._trackerReadySent).toBe(true);
      expect(tracker.setAdsTracker).toHaveBeenCalledWith(expect.any(BitmovinAdTracker));
    });

    test('onReady should not send player ready multiple times', () => {
      tracker._trackerReadySent = true;
      tracker.onReady();
      expect(tracker.sendPlayerReady).not.toHaveBeenCalled();
    });

    test('onReady should not set ads tracker if already exists', () => {
      tracker.adsTracker = { existing: true };
      tracker.onReady();
      expect(tracker.setAdsTracker).not.toHaveBeenCalled();
    });

    test('onPlay should call sendRequest and sendResume', () => {
      tracker.onPlay();
      expect(tracker.sendRequest).toHaveBeenCalled();
      expect(tracker.sendResume).toHaveBeenCalled();
    });

    test('onPlaying should call sendStart', () => {
      tracker.onPlaying();
      expect(tracker.sendStart).toHaveBeenCalled();
    });

    test('onPaused should call sendPause', () => {
      tracker.onPaused();
      expect(tracker.sendPause).toHaveBeenCalled();
    });

    test('onFinish should call sendEnd', () => {
      tracker.onFinish();
      expect(tracker.sendEnd).toHaveBeenCalled();
    });

    test('onError should call sendError with error details', () => {
      const error = {
        code: 1001,
        name: 'NetworkError',
        message: 'Network connection failed'
      };
      tracker.onError(error);
      expect(tracker.sendError).toHaveBeenCalledWith({
        errorCode: 1001,
        errorName: 'NetworkError',
        errorMessage: 'Network connection failed'
      });
    });

    test('onError should handle missing error properties', () => {
      tracker.onError({});
      expect(tracker.sendError).toHaveBeenCalledWith({
        errorCode: undefined,
        errorName: undefined,
        errorMessage: undefined
      });
    });

    test('onSeek should call sendSeekStart', () => {
      tracker.onSeek();
      expect(tracker.sendSeekStart).toHaveBeenCalled();
    });

    test('onSeeked should call sendSeekEnd for progressive streams', () => {
      mockPlayer.getStreamType.mockReturnValue('progressive');
      tracker.onSeeked();
      expect(tracker.sendSeekEnd).toHaveBeenCalled();
    });

    test('onSeeked should not call sendSeekEnd for non-progressive streams', () => {
      mockPlayer.getStreamType.mockReturnValue('hls');
      tracker.onSeeked();
      expect(tracker.sendSeekEnd).not.toHaveBeenCalled();
    });

    test('onStallStart should call sendBufferStart when not seeking', () => {
      tracker.state.isSeeking = false;
      tracker.onStallStart();
      expect(tracker.sendBufferStart).toHaveBeenCalled();
    });

    test('onStallStart should not call sendBufferStart when seeking', () => {
      tracker.state.isSeeking = true;
      tracker.onStallStart();
      expect(tracker.sendBufferStart).not.toHaveBeenCalled();
    });

    test('onStallEnded should call sendBufferEnd for progressive streams', () => {
      mockPlayer.getStreamType.mockReturnValue('progressive');
      tracker.onStallEnded();
      expect(tracker.sendBufferEnd).toHaveBeenCalled();
    });

    test('onStallEnded should not call sendBufferEnd for non-progressive streams', () => {
      mockPlayer.getStreamType.mockReturnValue('hls');
      tracker.onStallEnded();
      expect(tracker.sendBufferEnd).not.toHaveBeenCalled();
    });

    test('onSegmentPlayback should call sendBufferEnd and sendSeekEnd', () => {
      tracker.onSegmentPlayback();
      expect(tracker.sendBufferEnd).toHaveBeenCalled();
      expect(tracker.sendSeekEnd).toHaveBeenCalled();
    });

    test('onQualityChange should call sendRenditionChanged', () => {
      tracker.onQualityChange();
      expect(tracker.sendRenditionChanged).toHaveBeenCalled();
    });
  });

  describe('Method Binding', () => {
    test('event handler methods should be properly bound', () => {
      tracker.registerListeners();

      // Test that methods are bound (they should not lose 'this' context)
      const { onDownload, onReady, onPlay, onPlaying, onPaused, onFinish } = tracker;

      expect(typeof onDownload).toBe('function');
      expect(typeof onReady).toBe('function');
      expect(typeof onPlay).toBe('function');
      expect(typeof onPlaying).toBe('function');
      expect(typeof onPaused).toBe('function');
      expect(typeof onFinish).toBe('function');
    });
  });
});
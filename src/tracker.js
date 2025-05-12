import nrvideo from '@newrelic/video-core'
import { version } from '../package.json';
import { BitmovinAdTracker } from './ads';
import { Player, PlayerEvent } from 'bitmovin-player';

export default class BitmovinTracker extends nrvideo.VideoTracker {
  constructor(player, options) {
    super(player, options);
    this._trackerReadySent = false;
    nrvideo.Core.addTracker(this);
  }

  getTrackerName() {
    return 'bitmovin';
  }

  getTrackerVersion() {
    return version;
  }

  getPlayerName() {
    return 'Bitmovin';
  }

  getInstrumentationProvider() {
    return 'New Relic';
  }

  getInstrumentationName() {
    return this.getPlayerName();
  }

  getInstrumentationVersion() {
    return this.getPlayerVersion();
  }

  getPlayhead() {
    return this.player.getCurrentTime();
  }

  getDuration() {
    return this.player.getDuration();
  }

  isLive() {
    return this.player.isLive();
  }

  getRenditionBitrate() {
    let qty = this.player.getVideoQuality();

    if (qty) {
      return qty.bitrate;
    }
  }

  getRenditionName() {
    let qty = this.player.getVideoQuality();
    if (qty) {
      return qty.label;
    }
  }

  getRenditionWidth() {
    let qty = this.player.getVideoQuality();
    if (qty) {
      return qty.width;
    }
  }

  getRenditionHeight() {
    let qty = this.player.getVideoQuality();
    if (qty) {
      return qty.height;
    }
  }

  getSrc() {
    let source = this.player.getSource();
    let streamType = this.player.getStreamType();

    if (!source) return 'unknown';

    if (streamType in source) {
      return source[streamType];
    } else {
      return 'unknown';
    }
  }

  getPlayerVersion() {
    return this.player.version;
  }

  isMuted() {
    return this.player.isMuted();
  }

  getPlayrate() {
    return this.player.getPlaybackSpeed();
  }

  isAutoplayed() {
    let config = this.player.getConfig();
    if (config) {
      return config.autoplay;
    }
  }

  getPreload() {
    return null;
  }

  getLanguage() {
    let audio = this.player.getAudio();
    if (audio) {
      return audio.lang;
    }
  }

  registerListeners() {

    //NOTE: event that are too verbose are commented out.
    nrvideo.Log.debugCommonVideoEvents(this.player, [
      null,
      'adbreakfinished',
      'adbreakstarted',
      'adclicked',
      'aderror',
      'adfinished',
      'adinteraction',
      'adlinearitychanged',
      'admanifestloaded',
      'adquartile',
      'adskipped',
      'adstarted',
      'airplayavailable',
      'airplaychanged',
      'aspectratiochanged',
      //ev.AudioAdaptation,
      'audioadded',
      'audiochanged',
      'audiodownloadqualitychange',
      'audiodownloadqualitychanged',
      'audioplaybackqualitychanged',
      'audioqualityadded',
      'audioqualitychanged',
      'audioqualityremoved',
      'audioremoved',
      'castavailable',
      'caststart',
      'caststarted',
      'caststopped',
      'castwaitingfordevice',
      'cueenter',
      'cueexit',
      'cueparsed',
      'cueupdate',
      'dvrwindowexceeded',
      'destroy',
      //ev.DownloadFinished,
      'drmlicenseadded',
      'durationchanged',
      'error',
      'latencymodechanged',
      'licensevalidated',
      'metadata',
      'metadatachanged',
      'metadataparsed',
      'moduleready',
      'muted',
      'overlayadstarted',
      'paused',
      'periodswitch',
      'periodswitched',
      'play',
      'playbackfinished',
      'playbackspeedchanged',
      'playerresized',
      'playing',
      'ready',
      'seek',
      'seeked',
      'segmentplayback',
      //ev.SegmentRequestFinished,
      'showairplaytargetpicker',
      'sourceloaded',
      'sourceunloaded',
      'stallended',
      'stallstarted',
      'subtitleadded',
      'subtitledisable',
      'subtitledisabled',
      'subtitleenable',
      'subtitleenabled',
      'subtitleremoved',
      'targetlatencychanged',
      //ev.TimeChanged,
      'timeshift',
      'timeshifted',
      'unmuted',
      'vrstereochanged',
      'vrviewingdirectionchange',
      'vrviewingdirectionchanged',
      //ev.VideoAdaptation,
      'videodownloadqualitychange',
      'videodownloadqualitychanged',
      'videoplaybackqualitychanged',
      'videoqualityadded',
      'videoqualitychanged',
      'videoqualityremoved',
      'viewmodechanged',
      'volumechanged',
      'warning',
    ]);

   
    this.player.on('sourceloaded', this.onDownload.bind(this));
    this.player.on('ready', this.onReady.bind(this));
    this.player.on('play', this.onPlay.bind(this));
    this.player.on('playing', this.onPlaying.bind(this));
    this.player.on('paused', this.onPaused.bind(this));
    this.player.on('playbackfinished', this.onFinish.bind(this));
    this.player.on('error', this.onError.bind(this));
    this.player.on('seek', this.onSeek.bind(this));
    this.player.on('seeked', this.onSeeked.bind(this));
    this.player.on('stallstarted', this.onStallStart.bind(this));
    this.player.on('stallended', this.onStallEnded.bind(this));
    this.player.on('segmentplayback', this.onSegmentPlayback.bind(this));
    // NOTE: In Bitmovin v7 the event was ON_VIDEO_QUALITY_CHANGED, not sure if it translated to VideoPlaybackQualityChanged or VideoDownloadQualityChanged
    this.player.on(
      'videoplaybackqualitychanged',
      this.onQualityChange.bind(this)
    );
  }

  unregisterListeners() {
    console.log('Bitmovin player unregister', bitmovin.player);
    console.log('Bitmovin player unregister2', bitmovin.player.PlayerEvent);
    // let ev = bitmovin.player.PlayerEvent;
    // let ev = PlayerEvent;

    this.player.off('sourceloaded', this.onDownload);
    this.player.off('ready', this.onReady);
    this.player.off('play', this.onPlay);
    this.player.off('playing', this.onPlaying);
    this.player.off('paused', this.onPaused);
    this.player.off('playbackfinished', this.onFinish);
    this.player.off('error', this.onError);
    this.player.off('seek', this.onSeek);
    this.player.off('seeked', this.onSeeked);
    this.player.off('stallstarted', this.onStallStart);
    this.player.off('stallended', this.onStallEnded);
    this.player.off('segmentplayback', this.onSegmentPlayback);
    // NOTE: In Bitmovin v7 the event was ON_VIDEO_QUALITY_CHANGED, not sure if it translated to VideoPlaybackQualityChanged or VideoDownloadQualityChanged
    this.player.off('videoplaybackqualitychanged', this.onQualityChange);
  }

  onDownload(e) {
    this.sendDownload({ state: e.type });
  }

  onReady() {
    if (!this._trackerReadySent) {
      this.sendPlayerReady();
      this._trackerReadySent = true;
    }

    if (!this.adsTracker) {
      this.setAdsTracker(new BitmovinAdTracker(this.player));
    }
  }

  onPlay() {
    this.sendRequest();
    this.sendResume();
  }

  onPlaying() {
    this.sendStart();
  }

  onPaused() {
    this.sendPause();
  }

  onFinish() {
    this.sendEnd();
  }

  onError(e) {
    this.sendError({
      errorCode: e?.code,
      errorName: e?.name,
      errorMessage: e?.message,
    });
  }

  onSeek() {
    this.sendSeekStart();
  }

  onSeeked() {
    if (this.player.getStreamType() === 'progressive') {
      this.sendSeekEnd();
    }
  }

  onStallStart() {
    if (!this.state.isSeeking) {
      this.sendBufferStart();
    }
  }

  onStallEnded() {
    if (this.player.getStreamType() === 'progressive') {
      this.sendBufferEnd();
    }
  }

  onSegmentPlayback() {
    this.sendBufferEnd();
    this.sendSeekEnd();
  }

  onQualityChange() {
    this.sendRenditionChanged();
  }
}

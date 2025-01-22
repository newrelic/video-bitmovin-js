import * as nrvideo from 'newrelic-video-core';
import { version } from '../package.json';
import { BitmovinAdTracker } from './ads';

export default class BitmovinTracker extends nrvideo.VideoTracker {
  constructor(player, options) {
    super(player, options);
    this._trackerReadySent = false;
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
    let ev = bitmovin.player.PlayerEvent;

    //NOTE: event that are too verbose are commented out.
    nrvideo.Log.debugCommonVideoEvents(this.player, [
      null,
      ev.AdBreakFinished,
      ev.AdBreakStarted,
      ev.AdClicked,
      ev.AdError,
      ev.AdFinished,
      ev.AdInteraction,
      ev.AdLinearityChanged,
      ev.AdManifestLoaded,
      ev.AdQuartile,
      ev.AdSkipped,
      ev.AdStarted,
      ev.AirplayAvailable,
      ev.AirplayChanged,
      ev.AspectRatioChanged,
      //ev.AudioAdaptation,
      ev.AudioAdded,
      ev.AudioChanged,
      ev.AudioDownloadQualityChange,
      ev.AudioDownloadQualityChanged,
      ev.AudioPlaybackQualityChanged,
      ev.AudioQualityAdded,
      ev.AudioQualityChanged,
      ev.AudioQualityRemoved,
      ev.AudioRemoved,
      ev.CastAvailable,
      ev.CastStart,
      ev.CastStarted,
      ev.CastStopped,
      ev.CastWaitingForDevice,
      ev.CueEnter,
      ev.CueExit,
      ev.CueParsed,
      ev.CueUpdate,
      ev.DVRWindowExceeded,
      ev.Destroy,
      //ev.DownloadFinished,
      ev.DrmLicenseAdded,
      ev.DurationChanged,
      ev.Error,
      ev.LatencyModeChanged,
      ev.LicenseValidated,
      ev.Metadata,
      ev.MetadataChanged,
      ev.MetadataParsed,
      ev.ModuleReady,
      ev.Muted,
      ev.OverlayAdStarted,
      ev.Paused,
      ev.PeriodSwitch,
      ev.PeriodSwitched,
      ev.Play,
      ev.PlaybackFinished,
      ev.PlaybackSpeedChanged,
      ev.PlayerResized,
      ev.Playing,
      ev.Ready,
      ev.Seek,
      ev.Seeked,
      ev.SegmentPlayback,
      //ev.SegmentRequestFinished,
      ev.ShowAirplayTargetPicker,
      ev.SourceLoaded,
      ev.SourceUnloaded,
      ev.StallEnded,
      ev.StallStarted,
      ev.SubtitleAdded,
      ev.SubtitleDisable,
      ev.SubtitleDisabled,
      ev.SubtitleEnable,
      ev.SubtitleEnabled,
      ev.SubtitleRemoved,
      ev.TargetLatencyChanged,
      //ev.TimeChanged,
      ev.TimeShift,
      ev.TimeShifted,
      ev.Unmuted,
      ev.VRStereoChanged,
      ev.VRViewingDirectionChange,
      ev.VRViewingDirectionChanged,
      //ev.VideoAdaptation,
      ev.VideoDownloadQualityChange,
      ev.VideoDownloadQualityChanged,
      ev.VideoPlaybackQualityChanged,
      ev.VideoQualityAdded,
      ev.VideoQualityChanged,
      ev.VideoQualityRemoved,
      ev.ViewModeChanged,
      ev.VolumeChanged,
      ev.Warning,
    ]);

    this.player.on(ev.SourceLoaded, this.onDownload.bind(this));
    this.player.on(ev.Ready, this.onReady.bind(this));
    this.player.on(ev.Play, this.onPlay.bind(this));
    this.player.on(ev.Playing, this.onPlaying.bind(this));
    this.player.on(ev.Paused, this.onPaused.bind(this));
    this.player.on(ev.PlaybackFinished, this.onFinish.bind(this));
    this.player.on(ev.Error, this.onError.bind(this));
    this.player.on(ev.Seek, this.onSeek.bind(this));
    this.player.on(ev.Seeked, this.onSeeked.bind(this));
    this.player.on(ev.StallStarted, this.onStallStart.bind(this));
    this.player.on(ev.StallEnded, this.onStallEnded.bind(this));
    this.player.on(ev.SegmentPlayback, this.onSegmentPlayback.bind(this));
    // NOTE: In Bitmovin v7 the event was ON_VIDEO_QUALITY_CHANGED, not sure if it translated to VideoPlaybackQualityChanged or VideoDownloadQualityChanged
    this.player.on(
      ev.VideoPlaybackQualityChanged,
      this.onQualityChange.bind(this)
    );
  }

  unregisterListeners() {
    let ev = bitmovin.player.PlayerEvent;

    this.player.off(ev.SourceLoaded, this.onDownload);
    this.player.off(ev.Ready, this.onReady);
    this.player.off(ev.Play, this.onPlay);
    this.player.off(ev.Playing, this.onPlaying);
    this.player.off(ev.Paused, this.onPaused);
    this.player.off(ev.PlaybackFinished, this.onFinish);
    this.player.off(ev.Error, this.onError);
    this.player.off(ev.Sekk, this.onSeek);
    this.player.off(ev.Seeked, this.onSeeked);
    this.player.off(ev.StallStarted, this.onStallStart);
    this.player.off(ev.StallEnded, this.onStallEnded);
    this.player.off(ev.SegmentPlayback, this.onSegmentPlayback);
    // NOTE: In Bitmovin v7 the event was ON_VIDEO_QUALITY_CHANGED, not sure if it translated to VideoPlaybackQualityChanged or VideoDownloadQualityChanged
    this.player.off(ev.VideoPlaybackQualityChanged, this.onQualityChange);
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
    this.sendError({ errorCode: e.code, errorName: e.message });
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

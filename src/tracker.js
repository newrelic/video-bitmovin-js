import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export default class BitmovinTracker extends nrvideo.VideoTracker {
  constructor (player, options) {
    super(player, options)

    this._contentState = this.state
    this._adState = new nrvideo.VideoTrackerState()
    this._trackerReadySent = false
  }

  setIsAd (ad) {
    this.state = ad ? this._adState : this._contentState
    nrvideo.VideoTracker.prototype.setIsAd.call(this, ad) // super
  }

  getViewId () {
    return this._contentState.getViewId()
  }

  getViewSession () {
    return this._contentState.getViewSession()
  }

  getTrackerName () {
    return 'bitmovin'
  }

  getTrackerVersion () {
    return version
  }

  getPlayhead () {
    return this.player.getCurrentTime()
  }

  getDuration () {
    return this.player.getDuration()
  }

  isLive () {
    return this.player.isLive()
  }

  getRenditionBitrate () {
    let qty = this.player.getVideoQuality()
    if (qty) {
      return qty.bitrate
    }
  }

  getRenditionName () {
    let qty = this.player.getVideoQuality()
    if (qty) {
      return qty.label
    }
  }

  getRenditionWidth () {
    let qty = this.player.getVideoQuality()
    if (qty) {
      return qty.width
    }
  }

  getRenditionHeight () {
    let qty = this.player.getVideoQuality()
    if (qty) {
      return qty.height
    }
  }

  getSrc () {
    if (this.player.getStreamType() === 'progressive') {
      return this.tag.currentSrc
    } else {
      return this.player.getManifest()
    }
  }

  getPlayerVersion () {
    return bitmovin.player.version
  }

  isMuted () {
    return this.player.isMuted()
  }

  getPlayrate () {
    return this.player.getPlaybackSpeed()
  }

  isAutoplayed () {
    let config = this.player.getConfig()
    if (config) {
      return config.autoplay
    }
  }

  getPreload () {
    return null
  }

  getLanguage () {
    let audio = this.player.getAudio()
    if (audio) {
      return audio.lang
    }
  }

  registerListeners () {
    let ev = bitmovin.player.EVENT

    nrvideo.Log.debugCommonVideoEvents(this.player, [
      null,
      ev.ON_AD_CLICKED,
      ev.ON_AD_ERROR,
      ev.ON_AD_FINISHED,
      ev.ON_AD_LINEARITY_CHANGED,
      ev.ON_AD_MANIFEST_LOADED,
      ev.ON_AD_PLAYBACK_FINISHED,
      ev.ON_AD_SCHEDULED,
      ev.ON_AD_SKIPPED,
      ev.ON_AD_STARTED,
      ev.ON_AIRPLAY_AVAILABLE,
      ev.ON_AUDIO_ADDED,
      ev.ON_AUDIO_CHANGED,
      ev.ON_AUDIO_QUALITY_CHANGED,
      ev.ON_AUDIO_REMOVED,
      ev.ON_CAST_AVAILABLE,
      ev.ON_CAST_PAUSED,
      ev.ON_CAST_PLAYBACK_FINISHED,
      ev.ON_CAST_PLAYING,
      ev.ON_CAST_START,
      ev.ON_CAST_STARTED,
      ev.ON_CAST_STOPPED,
      ev.ON_CAST_TIME_UPDATED,
      ev.ON_CAST_WAITING_FOR_DEVICE,
      ev.ON_CUE_ENTER,
      ev.ON_CUE_EXIT,
      ev.ON_CUE_UPDATE,
      ev.ON_DESTROY,
      ev.ON_DVR_WINDOW_EXCEEDED,
      ev.ON_ERROR,
      ev.ON_FULLSCREEN_ENTER,
      ev.ON_FULLSCREEN_EXIT,
      ev.ON_HIDE_CONTROLS,
      ev.ON_METADATA,
      ev.ON_MUTED,
      ev.ON_PAUSED,
      ev.ON_PERIOD_SWITCH,
      ev.ON_PERIOD_SWITCHED,
      ev.ON_PICTURE_IN_PICTURE_ENTER,
      ev.ON_PICTURE_IN_PICTURE_EXIT,
      ev.ON_PLAY,
      ev.ON_PLAYBACK_FINISHED,
      ev.ON_PLAYER_CREATED,
      ev.ON_PLAYER_RESIZE,
      ev.ON_PLAYING,
      ev.ON_READY,
      ev.ON_SEEK,
      ev.ON_SEEKED,
      ev.ON_SEGMENT_PLAYBACK,
      ev.ON_SHOW_AIRPLAY_TARGET_PICKER,
      ev.ON_SHOW_CONTROLS,
      ev.ON_SOURCE_LOADED,
      ev.ON_SOURCE_UNLOADED,
      ev.ON_STALL_ENDED,
      ev.ON_STALL_STARTED,
      ev.ON_UNMUTED,
      ev.ON_VIDEO_QUALITY_CHANGED,
      ev.ON_VOLUME_CHANGED,
      ev.ON_VR_STEREO_CHANGED,
      ev.ON_VR_VIEWING_DIRECTION_CHANGE,
      ev.ON_VR_VIEWING_DIRECTION_CHANGED,
      ev.ON_WARNING
    ])

    this.player.addEventHandler(ev.ON_AD_STARTED, this.onAdStarted.bind(this))
    this.player.addEventHandler(ev.ON_AD_FINISHED, this.onAdFinished.bind(this))
    this.player.addEventHandler(ev.ON_AD_SKIPPED, this.onAdSkipped.bind(this))
    this.player.addEventHandler(ev.ON_AD_CLICKED, this.onAdClicked.bind(this))
    this.player.addEventHandler(ev.ON_AD_ERROR, this.onAdError.bind(this))

    this.player.addEventHandler(ev.ON_READY, this.onReady.bind(this))
    this.player.addEventHandler(ev.ON_PLAY, this.onPlay.bind(this))
    this.player.addEventHandler(ev.ON_PLAYING, this.onPlaying.bind(this))
    this.player.addEventHandler(ev.ON_PAUSED, this.onPaused.bind(this))
    this.player.addEventHandler(ev.ON_PLAYBACK_FINISHED, this.onFinish.bind(this))
    this.player.addEventHandler(ev.ON_ERROR, this.onError.bind(this))
    this.player.addEventHandler(ev.ON_SEEK, this.onSeek.bind(this))
    this.player.addEventHandler(ev.ON_SEEKED, this.onSeeked.bind(this))
    this.player.addEventHandler(ev.ON_STALL_STARTED, this.onStallStart.bind(this))
    this.player.addEventHandler(ev.ON_STALL_ENDED, this.onStallEnded.bind(this))
    this.player.addEventHandler(ev.ON_SEGMENT_PLAYBACK, this.onSegmentPlayback.bind(this))
    this.player.addEventHandler(ev.ON_VIDEO_QUALITY_CHANGED, this.onQualityChange.bind(this))
  }

  unregisterListeners () {
    let ev = bitmovin.player.EVENT

    this.player.removeEventHandler(ev.ON_AD_STARTED, this.onAdStarted)
    this.player.removeEventHandler(ev.ON_AD_FINISHED, this.onAdFinished)
    this.player.removeEventHandler(ev.ON_AD_SKIPPED, this.onAdSkipped)
    this.player.removeEventHandler(ev.ON_AD_CLICKED, this.onAdClicked)
    this.player.removeEventHandler(ev.ON_AD_ERROR, this.onAdError)

    this.player.removeEventHandler(ev.ON_READY, this.onReady)
    this.player.removeEventHandler(ev.ON_PLAY, this.onPlay)
    this.player.removeEventHandler(ev.ON_PLAYING, this.onPlaying)
    this.player.removeEventHandler(ev.ON_PAUSED, this.onPaused)
    this.player.removeEventHandler(ev.ON_PLAYBACK_FINISHED, this.onFinish)
    this.player.removeEventHandler(ev.ON_ERROR, this.onError)
    this.player.removeEventHandler(ev.ON_SEEK, this.onSeek)
    this.player.removeEventHandler(ev.ON_SEEKED, this.onSeeked)
    this.player.removeEventHandler(ev.ON_STALL_STARTED, this.onStallStart)
    this.player.removeEventHandler(ev.ON_STALL_ENDED, this.onStallEnded)
    this.player.removeEventHandler(ev.ON_SEGMENT_PLAYBACK, this.onSegmentPlayback)
    this.player.removeEventHandler(ev.ON_VIDEO_QUALITY_CHANGED, this.onQualityChange)
  }

  onAdStarted () {
    this.setIsAd(true)
    this.sendRequest()
  }

  onAdSkipped () {
    this.sendEnd({ skipped: true })
    this.setIsAd(false)
  }

  onAdFinished () {
    this.sendEnd()
    this.setIsAd(false)
  }

  onAdClicked (e) {
    this.sendAdClick({ url: e.clickThroughUrl })
  }

  onAdError (e) {
    this.sendError({ message: 'ad error' })
  }

  onReady () {
    if (!this._trackerReadySent) {
      this.sendPlayerReady()
      this._trackerReadySent = true
      // Set tag element
      if (!this.tag || this.tag === this.player) this.tag = this.player.getVideoElement()
    }
  }

  onPlay () {
    this.sendRequest()
    this.sendResume()
  }

  onPlaying () {
    this.sendStart()
  }

  onPaused () {
    this.sendPause()
  }

  onFinish () {
    this.sendEnd()
  }

  onError (e) {
    this.sendError(e)
  }

  onSeek () {
    this.sendSeekStart()
  }

  onSeeked () {
    if (this.player.getStreamType() === 'progressive') {
      this.sendSeekEnd()
    }
  }

  onStallStart () {
    if (!this.state.isSeeking) {
      this.sendBufferStart()
    }
  }

  onStallEnded () {
    if (this.player.getStreamType() === 'progressive') {
      this.sendBufferEnd()
    }
  }

  onSegmentPlayback () {
    this.sendBufferEnd()
    this.sendSeekEnd()
  }

  onQualityChange () {
    this.sendRenditionChanged()
  }
}
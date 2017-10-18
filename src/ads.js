import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export default class ThePlatformAdsTracker extends nrvideo.VideoTracker {
  resetValues () {
    this.src = null
    this.title = null
    this.duration = null
    this.playhead = null
    this.position = null
    this.bitrate = null
  }

  getTrackerName () {
    return 'theplatform-ads'
  }

  getTrackerVersion () {
    return version
  }

  getDuration () {
    return this.duration
  }

  getResource () {
    return this.src
  }

  getPlayhead () {
    return this.playhead
  }

  getTitle () {
    return this.title
  }

  getRenditionBitrate () {
    return this.bitrate
  }

  getAdPosition () {
    return this.position
  }

  registerListeners () {
    this.player.addEventListener('OnMediaLoadStart', this.onMediaLoadStart.bind(this), this.scope)
    this.player.addEventListener('OnMediaError', this.onMediaError.bind(this), this.scope)
    this.player.addEventListener('OnMediaStart', this.onMediaStart.bind(this), this.scope)
    this.player.addEventListener('OnMediaEnd', this.onMediaEnd.bind(this), this.scope)
    this.player.addEventListener('OnMediaPlaying', this.onMediaPlaying.bind(this), this.scope)
    this.player.addEventListener('OnMediaPause', this.onMediaPause.bind(this), this.scope)
    this.player.addEventListener('OnMediaUnpause', this.onMediaUnpause.bind(this), this.scope)
    this.player.addEventListener('OnMediaBufferStart', this.onMediaBufferStart.bind(this),
      this.scope)
    this.player.addEventListener('OnMediaBufferComplete', this.onMediaBufferComplete.bind(this),
      this.scope)
  }

  unregisterListeners () {
    this.player.removeEventListener('OnMediaLoadStart', this.onMediaLoadStart, this.scope)
    this.player.removeEventListener('OnMediaError', this.onMediaError, this.scope)
    this.player.removeEventListener('OnMediaStart', this.onMediaStart, this.scope)
    this.player.removeEventListener('OnMediaEnd', this.onMediaEnd, this.scope)
    this.player.removeEventListener('OnMediaPlaying', this.onMediaPlaying, this.scope)
    this.player.removeEventListener('OnMediaPause', this.onMediaPause, this.scope)
    this.player.removeEventListener('OnMediaUnpause', this.onMediaUnpause, this.scope)
    this.player.removeEventListener('OnMediaBufferStart', this.onMediaBufferStart, this.scope)
    this.player.removeEventListener('OnMediaBufferComplete', this.onMediaBufferComplete, this.scope)
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
}

import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export class BitmovinAdTracker extends nrvideo.VideoTracker {

  getTrackerName () {
    return 'bitmovin-ads'
  }

  getTrackerVersion () {
    return version
  }

  getAdPosition () {
    switch (this.player.ads.getActiveAdBreak().position) {
      case 'pre':
        return nrvideo.Constants.AdPositions.PRE
      case 'post':
        return nrvideo.Constants.AdPositions.POST
      // For mid-roll, position is a number: https://cdn.bitmovin.com/player/web/8/docs/interfaces/advertising.adbreakconfig.html#position
      default:
        return nrvideo.Constants.AdPositions.MID
    }
  }

  registerListeners () {
    console.log("Ads registerListeners", this)
    let ev = bitmovin.player.PlayerEvent

    this.player.on(ev.AdBreakStarted, this.onAdBreakStarted.bind(this))
    this.player.on(ev.AdBreakFinished, this.onAdBreakFinished.bind(this))
    this.player.on(ev.AdStarted, this.onAdStarted.bind(this))
    this.player.on(ev.AdFinished, this.onAdFinished.bind(this))
    this.player.on(ev.AdSkipped, this.onAdSkipped.bind(this))
    this.player.on(ev.AdClicked, this.onAdClicked.bind(this))
    this.player.on(ev.AdQuartile, this.onAdQuartile.bind(this))
    this.player.on(ev.AdError, this.onAdError.bind(this))
  }

  unregisterListeners () {
    let ev = bitmovin.player.PlayerEvent

    this.player.off(ev.AdBreakStarted, this.onAdBreakStarted)
    this.player.off(ev.AdBreakFinished, this.onAdBreakFinished)
    this.player.off(ev.AdStarted, this.onAdStarted)
    this.player.off(ev.AdFinished, this.onAdFinished)
    this.player.off(ev.AdSkipped, this.onAdSkipped)
    this.player.off(ev.AdClicked, this.onAdClicked)
    this.player.off(ev.AdError, this.onAdError)
  }

  onAdBreakStarted (ev) {
    console.log("Ad break started ev = ", ev)
    this.sendAdBreakStart()
    console.log("Ad tracker after sendAdBreakStart =", this)
  }

  onAdBreakFinished (ev) {
    console.log("Ad break finished ev = ", ev, this)
    console.log("Ad tracker before sendAdBreakEnd =", this)
    this.sendAdBreakEnd()
  }

  onAdStarted (e) {
    console.log("Ad srarted =", e)
    this.sendRequest()
    this.sendStart()
  }

  onAdSkipped () {
    this.sendEnd({ skipped: true })
  }

  onAdFinished () {
    this.sendEnd()
  }

  onAdClicked (e) {
    this.sendAdClick({ url: e.clickThroughUrl })
  }

  onAdQuartile (e) {
    console.log("Quartile = ", e)
    let q = 0;
    switch (e.quartile) {
      case "firstQuartile":
        q = 1;
        break;
      case "secondQuartile":
        q = 2;
        break;
      case "thirdQuartile":
        q = 3;
        break;        
    }
    this.sendAdQuartile({ quartile: q })
  }

  onAdError (e) {
    this.sendError({code: e.code, message: e.message})
  }
}
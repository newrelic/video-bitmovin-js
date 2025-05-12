import nrvideo from '@newrelic/video-core'
import { version } from '../package.json';

export class BitmovinAdTracker extends nrvideo.VideoTracker {
  constructor(player) {
    super(player);
  }

  getTrackerName() {
    return 'bitmovin-ads';
  }

  getTrackerVersion() {
    return version;
  }

  // NOTE: This is causing a strange error, making the JS execution abort.
  // Tested with:
  // - Bitmovin 8.181.0
  // - Firefox 129.0 (mac)
  // getAdPosition () {
  //   switch (this.player.ads.getActiveAdBreak().position) {
  //     case 'pre':
  //       return nrvideo.Constants.AdPositions.PRE
  //     case 'post':
  //       return nrvideo.Constants.AdPositions.POST
  //     // For mid-roll, position is a number: https://cdn.bitmovin.com/player/web/8/docs/interfaces/advertising.adbreakconfig.html#position
  //     default:
  //       return nrvideo.Constants.AdPositions.MID
  //   }
  // }

  registerListeners() {

    this.player.on('adbreakstarted', this.onAdBreakStarted.bind(this));
    this.player.on('adbreakfinished', this.onAdBreakFinished.bind(this));
    this.player.on('adstarted', this.onAdStarted.bind(this));
    this.player.on('adfinished', this.onAdFinished.bind(this));
    this.player.on('adskipped', this.onAdSkipped.bind(this));
    this.player.on('adclicked', this.onAdClicked.bind(this));
    this.player.on('adquartile', this.onAdQuartile.bind(this));
    this.player.on('aderror', this.onAdError.bind(this));
  }

  unregisterListeners() {

    this.player.off('adbreakstarted', this.onAdBreakStarted);
    this.player.off('adbreakfinished', this.onAdBreakFinished);
    this.player.off('adstarted', this.onAdStarted);
    this.player.off('adfinished', this.onAdFinished);
    this.player.off('adskipped', this.onAdSkipped);
    this.player.off('adclicked', this.onAdClicked);
    this.player.off('adquartile', this.onAdQuartile);
    this.player.off('aderror', this.onAdError);
  }

  onAdBreakStarted(ev) {
    this.sendAdBreakStart();
  }

  onAdBreakFinished(ev) {
    this.sendAdBreakEnd();
  }

  onAdStarted(e) {
    this.sendRequest();
    this.sendStart();
  }

  onAdSkipped() {
    this.sendEnd({ skipped: true });
  }

  onAdFinished() {
    this.sendEnd();
  }

  onAdClicked(e) {
    this.sendAdClick({ url: e.clickThroughUrl });
  }

  onAdQuartile(e) {
    let q = 0;
    switch (e.quartile) {
      case 'firstQuartile':
        q = 1;
        break;
      case 'midpoint':
        q = 2;
        break;
      case 'thirdQuartile':
        q = 3;
        break;
    }
    this.sendAdQuartile({ quartile: q });
  }

  onAdError(e) {
    this.sendError({ errorCode: e.code, errorMessage: e.message });
  }
}

# newrelic-video-bitmovin [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
#### [New Relic](http://newrelic.com) video tracking for Bitmovin

## Requirements
This video monitor solutions works on top of New Relic's **Browser Agent**.

## Usage
Load **scripts** inside `dist` folder into your page.

> If dist folder is not included, run `npm i && npm run build` to build it.

Init the tracker as follows:

```js
  // Init player
  var player = bitmovin.player("player")
  
  // Init New Relic Tracker  
  nrvideo.Core.addTracker(new nrvideo.BitmovinTracker(player))
  
  player.setup(conf)
```


### Report init errors
You can use bitmovin's promise error callback to report failed player setups:
```js
  player.setup(conf).then(success, fail)

  function fail (reason) {
    nrvideo.Core.sendError({message: reason})
  }
```

## Known Limitations
Due to the information exposed by player provider, this tracker may not be able to report:
- adPosition attribute
- AD_QUARTILE events
- AD_BREAK events
- DOWNLOAD events

### Buffering
If the players works with *progressive download* files (mp3, webm...) you may encounter `buffering` events after a seek, as that's the player behavior.
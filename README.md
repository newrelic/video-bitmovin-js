[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

# New Relic Bitmovin Tracker

New Relic video tracking for Bitmovin.

## Requirements

This video monitor solutions works on top of New Relic's **Browser Agent**.

## Build

Install dependencies:

```
$ npm install
```

And build:

```
$ npm run build:dev
```

Or if you need a production build:

```
$ npm run build
```

## Usage

Load **scripts** inside `dist` folder into your page.

Init the tracker as follows:

```js
  var conf = {
    key:       "...key...",
    source: {
      dash:        "//bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
      hls:         "//bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
      progressive: "//bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4",
      poster:      "//bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg"
    }
  };
  // Init player
  const player = new bitmovin.player.Player(document.getElementById('player'), conf);
  // Init tracker
  nrvideo.Core.addTracker(new nrvideo.BitmovinTracker(player))
  // Load content
  player.load(conf.source)
```

### Report init errors

You can use bitmovin's promise error callback to report failed player setups:

```js
  player.load(conf.source).then(
  player => {
      console.log('Successfully created Bitmovin Player instance')
  },
  reason => {
      console.log('Error while creating Bitmovin Player instance')
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

## Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT. Issues and contributions should be reported to the project here on GitHub.

We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

## Contributing

We encourage your contributions to improve New Relic Bitmovin Tracker! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project. If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company, please drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License

New Relic Bitmovin Tracker is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

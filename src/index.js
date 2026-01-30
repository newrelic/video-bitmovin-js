import nrvideo from '@newrelic/video-core';
import BitmovinTracker from './tracker';

// Assign BitmovinTracker to the nrvideo object
nrvideo.BitmovinTracker = BitmovinTracker;

// Export both for compatibility
module.exports = nrvideo;
module.exports.default = nrvideo;

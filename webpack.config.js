var path = require('path');
var webpack = require('webpack');
var TerserPlugin = require('terser-webpack-plugin');

var pkg = require('./package.json');
var license =
  '@license ' +
  pkg.license +
  '\n' +
  pkg.name +
  ' ' +
  pkg.version +
  '\nCopyright New Relic <http://newrelic.com/>' +
  '\n@author ' +
  pkg.author;

module.exports = [
  {
    //umd
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './dist/umd'),
      filename: 'newrelic-video-bitmovin.min.js',
      library: 'BitmovinTracker',
      libraryTarget: 'umd',
      libraryExport: 'default',
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(?:js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: license,
        entryOnly: true,
      }),
    ],
  },
  // commonjs buid
  {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './dist/cjs'),
      filename: 'index.js',
      library: 'BitmovinTracker',
      libraryTarget: 'commonjs2', // CommonJS format
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: 'defaults' }]],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: license,
        entryOnly: true,
      }),
    ],
  },
  // ES Module Build
  {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './dist/esm'),
      filename: 'index.js',
      library: {
        type: 'module', // ES Module format
      },
    },
    experiments: {
      outputModule: true, // Enable ES Module output
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults', modules: false }],
              ],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: license,
        entryOnly: true,
      }),
    ],
  },
  // BROWSER ENTRY: resolve.alias rewires @newrelic/video-core -> browser subpath
  // (excludes the unused connected-device pipeline from the bundle)
  // commonjs build
  {
    entry: './src/entry-browser.js',
    output: {
      path: path.resolve(__dirname, './dist/cjs/browser'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      alias: {
        '@newrelic/video-core$': require.resolve('@newrelic/video-core/browser'),
      },
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: 'defaults' }]],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: license,
        entryOnly: true,
      }),
    ],
  },
  // ES Module build
  {
    entry: './src/entry-browser.js',
    output: {
      path: path.resolve(__dirname, './dist/esm/browser'),
      filename: 'index.js',
      library: {
        type: 'module',
      },
    },
    resolve: {
      alias: {
        '@newrelic/video-core$': require.resolve('@newrelic/video-core/browser'),
      },
    },
    experiments: {
      outputModule: true,
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults', modules: false }],
              ],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: license,
        entryOnly: true,
      }),
    ],
  },
];

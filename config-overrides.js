const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Configuration existante pour la résolution des modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    zlib: require.resolve('browserify-zlib'),
    util: require.resolve('util'),
    assert: require.resolve('assert'),
    path: require.resolve('path-browserify'),
    crypto: require.resolve('crypto-browserify'),
    https: require.resolve('https-browserify'),
    http: require.resolve('stream-http'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    querystring: require.resolve('querystring-es3'),
    vm: require.resolve('vm-browserify'),
    fs: false,
    net: false,
    tls: false,
    child_process: false,
    http2: require.resolve('./src/polyfills/http2.js')
  };

  // Configuration des plugins
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]);

  // Configuration du serveur de développement améliorée
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        watch: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      client: {
        webSocketURL: 'auto://',
        overlay: {
          errors: true,
          warnings: false
        }
      }
    };
  }

  // Configuration pour les fichiers audio
  config.module.rules.push({
    test: /\.(wav|mp3)$/,
    type: 'asset/resource',
    generator: {
      filename: 'audio/[path][name][ext]'
    }
  });

  return config;
};
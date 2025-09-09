const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser"),
      "process/browser": require.resolve("process/browser"),
      "url": require.resolve("url/"),
      "querystring": require.resolve("querystring-es3"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false
    },
    alias: {
      'process': 'process/browser',
      'browser': 'process/browser'
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(mp3|wav)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env || {}),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false
    },
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    }
  },
  ignoreWarnings: [
    {
      module: /node_modules\/googleapis-common/
    },
    // Ignorer les avertissements liés aux fichiers .mjs de React Router
    {
      module: /node_modules\/react-router/
    }
  ],
  performance: {
    hints: process.env.NODE_ENV === 'production' ? "warning" : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    port: 3000,
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  }
};
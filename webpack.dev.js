const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  entry: './src/scripts/index.js', // ✅ Entry utama kamu
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // ✅ Generate index.html otomatis (hindari konflik)
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),

    // ✅ Copy hanya file penting lain
    new CopyWebpackPlugin({
      patterns: [
        // copy service worker
        { from: 'src/service-worker.js', to: '' },

        // copy favicon
        { from: 'src/public/favicon.png', to: '' },

        // copy folder images
        { from: 'src/public/images', to: 'images' },
      ],
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 9000,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});

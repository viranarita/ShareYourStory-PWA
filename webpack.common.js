const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    // Ini sudah benar, ini adalah titik masuk utama aplikasi kamu
    app: path.resolve(__dirname, 'src/scripts/index.js'), 
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Ini sudah bagus, otomatis membersihkan folder dist
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        // HANYA salin aset statis dari 'src/public/'
        // Ini akan menyalin:
        // - src/public/manifest.json -> dist/manifest.json
        // - src/public/favicon.png -> dist/favicon.png
        // - src/public/images/ -> dist/images/ (beserta semua isinya)
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
          noErrorOnMissing: true,
        },
        
        // HANYA salin 'service-worker.js'
        {
          from: path.resolve(__dirname, 'src/service-worker.js'),
          to: path.resolve(__dirname, 'dist/'),
        },

        // Kita HAPUS 'src/scripts/' dan 'src/styles/' dari sini
        // karena mereka sudah di-handle oleh 'entry' dan 'module.rules'
      ],
    }),
  ],
};
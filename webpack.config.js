
let webpack = require('webpack');
let StringReplacePlugin = require('string-replace-webpack-plugin');

let config = {
  entry: './index.js',
  output: {
    path: 'dist',
    filename: 'my-wallet.js',
    library: 'Blockchain',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015', { modules: false }]
            ]
          }
        }
      },
      {
        test: /hdnode\.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /curve\.validate\(Q\)/g,
              replacement: function (match, p1, offset, string) {
                // comment out value validation in fromBuffer to speed up node
                // creation from cached xpub/xpriv values
                return '    // curve.validate(Q)';
              }
            }
          ]})
      }
    ]
  },
  plugins: [
    new StringReplacePlugin()
  ]
};

if (process.env.NODE_ENV === 'prod') {
  let uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
    mangle: false,
    comments: false
  });

  config.output.filename = 'my-wallet.min.js';
  config.plugins.push(uglifyPlugin);
}

module.exports = config;

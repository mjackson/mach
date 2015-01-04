var webpack = require('webpack');

module.exports = {

  entry: './modules/index',

  output: {
    library: 'mach',
    libraryTarget: 'var'
  },

  node: {
    buffer: false,
    process: false
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]

};

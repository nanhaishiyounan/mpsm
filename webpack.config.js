const path = require('path')

const webpack = require('webpack')

module.exports = {

  entry: './packages/wxmp/mpsm/index.js',

  output: {

    path: path.resolve(__dirname, 'dist'),

    filename: 'mpsm.js',

    library: '',

    libraryExport: "default",


    libraryTarget: 'umd'

  },

  mode: "production",

  module: {

    rules: []

  },

  plugins: [


  ],

  externals: {



  }

}
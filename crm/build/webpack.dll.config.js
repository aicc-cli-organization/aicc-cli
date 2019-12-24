const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// const env = require('../config/'+process.env.env_config+'.env')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const env = require('../config/'+process.env.env_config+'.env')
console.log(env)

module.exports = {
  // mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    vendor: [
      './src/assets/go.js',
      './src/assets/sip.js',
      './src/assets/jszip.js',
      './src/assets/FileSaver.js',
      'axios',
      'element-ui',
      'echarts',
      'vue-chat-scroll',
      'js-cookie',
      'vue',
      'vue-i18n',
      'vue-router',
      'vuex',
      'moment',
      'sortablejs',
      'qs',
      'wavesurfer.js',
      'vuedraggable',
      'underscore'
      // 'babel-polyfill',
      // 'stompjs',
      // 'sockjs-client'
    ]
  },
  output: {
    path: path.resolve(__dirname, '../static/js'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  // module: {
  //   noParse: function(content) {
  //     return /sip\.js|go\.js|FileSaver\.js|jszip\.js/.test(content);
  //   },
  //   rules: [
  //     {
  //       test: /\.vue$/,
  //       loader: 'vue-loader'
  //     },
  //     {
  //       test: /\.js$/,
  //       loader: 'babel-loader',
  //       // exclude: /node_modules/,
  //       exclude: [resolve('src/assets/go.js'), resolve('src/assets/sip.js'), resolve('src/assets/FileSaver.js'), resolve('src/assets/jszip.js')]
  //     }
  //   ]
  // },
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       cache: true,
  //       parallel: true,
  //       sourceMap: false // set to true if you want JS source maps
  //     }),
  //     // Compress extracted CSS. We are using this plugin so that possible
  //     // duplicated CSS from different components can be deduped.
  //     new OptimizeCSSAssetsPlugin({})
  //   ]
  // },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': env
    // }),
    /*
      @desc: https://webpack.js.org/plugins/module-concatenation-plugin/
      "作用域提升(scope hoisting)",使代码体积更小[函数申明会产生大量代码](#webpack3)
    */
    // new webpack.DefinePlugin({
    //   'process.env': env
    // }),

    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: false, //config.build.productionSourceMap,
      parallel: true
    }),

    // new ExtractTextPlugin({
    //   filename: utils.assetsPath('css/[name].[contenthash].css'),
    //   // Setting the following option to `false` will not extract CSS from codesplit chunks.
    //   // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
    //   // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
    //   allChunks: false,
    // }),
    // // Compress extracted CSS. We are using this plugin so that possible
    // // duplicated CSS from different components can be deduped.
    // new OptimizeCSSPlugin({
    //   cssProcessorOptions: 
    //   // config.build.productionSourceMap
    //   //   ? { safe: true, map: { inline: false } }
    //     // : 
    //     { safe: true }
    // }),

    // new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DllPlugin({
      path: path.join(__dirname, '.', '[name]-manifest.json'),
      name: '[name]_library',
      context: __dirname
    })
  ]
}
'use strict'
// Template version: 1.2.6
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

const YuHangJianKongJuIP = 'yyscjdgl.tanyibot.com' // 余杭监控局IP
const NanShaIP = 'nsfy.tanyibot.com' // 共道，南沙
const GongDaoBeiJingIP = 'bjznyy.tanyibot.com' // 共道北京
const HangHuFaIP = 'netcourt.tanyibot.com' // 杭互法
const cscacIP = 'cscac.tanyibot.com' // 长沙仲裁委

module.exports = {
  // 全局环境变量
  env: {
    noLogoIP: ['47.98.67.68', YuHangJianKongJuIP, NanShaIP, GongDaoBeiJingIP, HangHuFaIP, cscacIP], // 需要替换logo和探意文字的ip，并去掉了微信绑定相关功能
    YuHangJianKongJuIP: `"${YuHangJianKongJuIP}"`, // 余杭监控局：登陆页文案修改
    GongDaoBeiJingIP: `"${GongDaoBeiJingIP}"`, // 共道北京：登陆页文案修改
    courtIP: [YuHangJianKongJuIP, GongDaoBeiJingIP, NanShaIP, HangHuFaIP, cscacIP] // 法院项目，文案替换：客户替换为用户，去掉商机分析
  },

  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/ai-call-platform-back': {
        target: 'https://crm.yiwise.com',
        secure: false
      },
      '/apiEngine': {
        target: 'https://crm.yiwise.com',
        secure: false,
        pathRewrite: {
          '^/apiEngine': '/apiEngine'
        }
      },
      '/apiEngine/webSocket': {
        target: 'https://crm.yiwise.com',
        secure: false,
        ws: true
      },
      '/apiDialogFlow/dialogFlow': {
        target: 'https://crm.yiwise.com',
        secure: false
      },
      '/apiPlatform': {
        target: 'https://crm.yiwise.com',
        secure: false
      },
      '/apiIvrNavigation': {
        target: 'https://crm.yiwise.com',
        secure: false
      },
      '/apiDialogFlow/shareKnowledge': {
        target: 'https://crm.yiwise.com',
        secure: false
      }
    },

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 9527, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: false,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: false,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: '#cheap-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',

    /**
     * You can set by youself according to actual condition
     * You will need to set this if you plan to deploy your site under a sub path,
     * for example GitHub pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then assetsPublicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     */
    assetsPublicPath: '/', // If you are deployed on the root path, please use '/'

    /**
     * Source Maps
     */
    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off

    bundleAnalyzerReport: process.env.npm_config_report
  }
}

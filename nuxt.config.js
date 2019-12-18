const pkg = require('./package')
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    link: [
      {
        rel: 'stylesheet',
        href: '//at.alicdn.com/t/font_747212_d4zc1jnlpi7.css'
      }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: ['element-ui/lib/theme-chalk/index.css'],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['@/plugins/element-ui'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    proxy: true
  },

  proxy: {
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

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    // plugins: [
    //   new webpack.DllReferencePlugin({
    //     context: path.resolve('./crm/build'),
    //     manifest: require('./crm/build/vendor-manifest.json')
    //   })
    // ],
    extend(config, { isDev, isClient, isServer }) {
      // Run ESLint on save
      if (isDev && isClient) {
        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /(node_modules)/
        // })
        // config.externals = [
        //   nodeExternals({ whitelist: [
        //     /^go.js/,
        //     /^sip.js/,
        //     /^jszip.js/,
        //     /^FileSaver.js/,
        //     /^element-ui/,
        //     /^axios/,
        //     /^echarts/,
        //     /^vue-chat-scroll/,
        //     /^js-cookie/,
        //     /^vue/,
        //     /^vue-i18n/,
        //     /^vue-router/,
        //     /^vuex/,
        //     /^moment/,
        //     /^sortablejs/,
        //     /^qs/,
        //     /^wavesurfer.js/,
        //     /^vuedraggable/,
        //     /^underscore/
        //   ] })
        // ]
      }

      config.resolve.alias['@'] = path.resolve('./crm/src')
      config.resolve.alias['~'] = path.resolve('./crm/src')
      config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js'
      config.resolve.alias['src'] = resolve('crm/src')
      console.log(resolve('crm/src'))

      if (isServer) {
        // config.externals = [
        //   nodeExternals({ whitelist: [
        //     /^go.js/,
        //     /^sip.js/,
        //     /^jszip.js/,
        //     /^FileSaver.js/,
        //     /^element-ui/,
        //     /^axios/,
        //     /^echarts/,
        //     /^vue-chat-scroll/,
        //     /^js-cookie/,
        //     /^vue/,
        //     /^vue-i18n/,
        //     /^vue-router/,
        //     /^vuex/,
        //     /^moment/,
        //     /^sortablejs/,
        //     /^qs/,
        //     /^wavesurfer.js/,
        //     /^vuedraggable/,
        //     /^underscore/
        //   ] })
        // ]
        // config.plugins.push(
        //   new webpack.DllReferencePlugin({
        //     context: path.resolve('./crm/build'),
        //     manifest: require('./crm/build/vendor-manifest.json')
        //   })
        // )
      }

      // console.log(config)
    }
  }
}

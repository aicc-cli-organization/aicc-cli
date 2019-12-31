const pkg = require('./package')
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')
const path = require('path')
var fs = require('fs')

// 子项目基础路径，以下设置则子系统首页路径为：http://localhost:3000/customer-center
const baseUrl = '/customer-center'

// node提示内存泄漏
require('events').EventEmitter.prototype._maxListeners = 100

const pollyfillStr = `
    if (typeof location === 'undefined') {
      var location = {
        href: '',
        search: ''
      }
    }

  if (typeof window === 'undefined') {
    var window = {
      location: location
    }
  }
  if (!window.localStorage) {
    window.localStorage = {}
  }
  if (!window.localStorage.getItem) {
    window.localStorage.getItem = function() {}
  }
  if (!window.location) {
    window.location = {
      href: ''
    }
  }
  if (!window.console) {
    window.console = {
      log: function() {}
    }
  }

  if (typeof Recorder === 'undefined') {
    var Recorder = function(){}
  }
`

// 给以下几个模块加上window对象
;[
  'node_modules/yiwise-components/dist/yiwise-components.common.js',
  'node_modules/wavesurfer.js/dist/wavesurfer.min.js',
  'node_modules/wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'
].forEach(np => {
  fs.readFile(np, function(err, data) {
    if (err) {
      return console.error(err)
    }
    let str = data
      .toString()
      .replace(/@\//g, resolve('crm/src').replace(/\\/g, '/') + '/')
    if (!str.includes(pollyfillStr)) {
      str = pollyfillStr + str
    }

    fs.writeFile(np, str, function(err) {
      if (err) {
        return console.error(err)
      }
      console.log('window兼容对象写入成功！')
    })
  })
})

fs.readdir('node_modules/element-ui/lib/theme-chalk/fonts', function(
  err,
  files
) {
  if (err) {
    return console.error(err)
  }
  fs.rmdir(`./static${baseUrl}/fonts`, { recursive: true }, function(err) {
    if (err) {
      return console.error(err)
    }
    console.log('字体目录删除成功。')
    fs.mkdir(`./static${baseUrl}/fonts`, { recursive: true }, function(err) {
      if (err) {
        return console.error(err)
      }
      console.log('字体目录创建成功。')
      files.forEach(function(file) {
        fs.readFile(
          'node_modules/element-ui/lib/theme-chalk/fonts/' + file,
          function(err, data) {
            if (err) {
              return console.error(err)
            }

            fs.writeFile(`./static${baseUrl}/fonts/` + file, data, function(
              err
            ) {
              if (err) {
                return console.error(err)
              }
              console.log('字体写入成功！')
            })
          }
        )
      })
    })
  })
})
fs.readFile(
  'node_modules/element-ui/packages/theme-chalk/src/icon.scss',
  function(err, data) {
    if (err) {
      return console.error(err)
    }

    let str = data.toString().replace(/\#\{\$\-\-font\-path\}/g, '/fonts')

    fs.writeFile(
      'node_modules/element-ui/packages/theme-chalk/src/icon.scss',
      str,
      function(err) {
        if (err) {
          return console.error(err)
        }
        console.log('字体引用修改成功！')
      }
    )
  }
)

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

const envMap = {
  test: 'https://crm.yiwise.com/',
  prod: 'https://crm.tanyibot.com/'
}

module.exports = {
  // mode: 'spa',

  env: {
    baseUrl: envMap[process.env.env_config]
  },

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
    ],
    script: [{ src: '//at.alicdn.com/t/font_747212_d4zc1jnlpi7.js' }]
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

  router: {
    base: baseUrl,
    middleware: 'auth'
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    plugins: [
      // new webpack.DllReferencePlugin({
      //   context: path.resolve('./crm/build'),
      //   manifest: require('./crm/build/vendor-manifest.json')
      // })
      new webpack.NormalModuleReplacementPlugin(/\@\//, function(resource) {
        if (resource.context.includes('crm')) {
          resource.request = resource.request.replace('@/', '@/crm/src/')
        } else if (resource.context.includes('aicc-components')) {
          resource.request = resource.request.replace(
            '@/',
            '@/aicc-components/'
          )
        }
      })
    ],
    loaders: {
      scss: {
        sassOptions: loaderContext => {
          // More information about available properties https://webpack.js.org/api/loaders/
          const { context } = loaderContext

          if (context.includes('crm')) {
            return {
              includePaths: [resolve('node_modules'), resolve('crm')]
            }
          } else if (context.includes('aicc-components')) {
            return {
              includePaths: [
                resolve('node_modules'),
                resolve('aicc-components')
              ]
            }
          }

          return {
            includePaths: [resolve('node_modules')]
          }
        }
        // [
        //   // 'node_modules/element-ui/packages/theme-chalk/src/index.scss'
        //   resolve('node_modules'),
        //   resolve('crm')
        // ]
      }
    },
    extend(config, { isDev, isClient, isServer }) {
      // Run ESLint on save
      if (isDev && isClient) {
        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /(node_modules)/
        // })
      }

      if (isServer) {
        config.externals = [
          'go.js',
          'downloadAudio.js',
          // 'sip'
          nodeExternals({
            whitelist: [
              /^element-ui/,
              /^yiwise-components/,
              /^normalize.css/,
              /^yiwise-components/
            ]
          })
          // function(context, request, callback) {
          //   console.log(request)
          //   if (
          //     request.match(/node_modules|go\.js|sip\.js|/) &&
          //     !request.match(/element-ui|yiwise-components/)
          //   ) {
          //     return callback(null, 'commonjs ' + request)
          //   }
          //   callback()
          // }
          // nodeExternals({
          //   whitelist: [
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
          //   ]
          // })
        ]
      }

      // config.resolve.alias['@'] = resolve('crm/src')
      // config.resolve.alias['~'] = resolve('crm/src')
      config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js'
      // config.resolve.alias['src'] = resolve('crm/src')
      config.resolve.alias['@aicc'] = resolve('aicc-components')
      config.resolve.alias['element-ui'] = resolve('node_modules/element-ui')
      // console.log(resolve('crm/src'))

      // config.plugins.push(
      //   new webpack.ContextReplacementPlugin(/^src$/, context => {
      //     console.log(context.context)
      //     // if (!/\/moment\//.test(context.context)) return

      //     Object.assign(context, {
      //       regExp: /^\.\/\w+/,
      //       request: '../../locale' // 相对路径解析
      //     })
      //     // console.log(context.context)
      //   })
      // )

      // config.module.rules.forEach(rule => {
      //   // rule.testStr = rule.test.toString()
      //   // if (rule.test.toString() === '/\\.jsx?$/i') {
      //   //   // rule.include = [
      //   //   //   resolve(
      //   //   //     'node_modules/yiwise-components/dist/yiwise-components.common.js'
      //   //   //   )
      //   //   // ]
      //   //   rule.exclude = [
      //   //     resolve('crm/src/assets/go.js'),
      //   //     resolve('crm/src/assets/sip.js')
      //   //   ]
      //   // }
      //   if (rule.test.toString() === '/\\.scss$/i') {

      //   }
      // })

      // fs.writeFile('input.txt', JSON.stringify(config.module.rules), function(
      //   err
      // ) {
      //   if (err) {
      //     return console.error(err)
      //   }
      //   console.log('数据写入成功！')
      // })

      // console.log(config.resolve.alias)
    }
  }
}

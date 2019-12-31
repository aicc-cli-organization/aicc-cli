import Vue from 'vue'
import Element from 'element-ui/lib/element-ui.common'

import '@aicc/theme/index.scss' // 重写element样式
import '@aicc/styles/index.scss' // global css

export default () => {
  Vue.use(Element, { size: 'small' })
}

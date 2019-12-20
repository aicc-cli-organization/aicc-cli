import Vue from 'vue'
import Element from 'element-ui/lib/element-ui.common'
import locale from 'element-ui/lib/locale/lang/en'

import '@@/theme/index.scss' // 重写element样式
import '@@/styles/index.scss' // global css

export default () => {
  Vue.use(Element, { locale, size: 'small' })
}

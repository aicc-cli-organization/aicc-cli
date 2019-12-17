import Vue from 'vue'
console.log('register counter--------------')
Vue.component('counter', {
  //1.组件名为"conter"; 2.data 写函数; 3.template 写组件的内容（元素和触发的事件）
  data: function() {
    return { count: 0 }
  },

  //template 是模板的意思，在 html 里面是一个可以同时控制多个子元素的父元素。在这里定义了组件的内容
  template:
    '<button v-on:click="count++">点击计算点击次数：{{count}}次</button>'
})

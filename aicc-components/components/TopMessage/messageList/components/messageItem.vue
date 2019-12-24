<template>
  <div class="message-item">
    <div class="item">
      <div class="dot" v-if="data.readStatus=='UNREAD'"></div>
      <div class="left-area">
        <div
          class="title"
          @click="setRead"
        >{{data.title || data.messageQueuePO && data.messageQueuePO.title}}</div>
      </div>
      <div class="time">{{data.createTime}}</div>
    </div>
    <div
      class="sub-title"
      @click="setRead"
      :style="open?{ 'whiteSpace': 'pre-wrap' }:{}"
    >{{text}}</div>
    <i v-if="!open && type === 'systemAnnouncement'" @click="show()" class="el-icon-arrow-down icon"></i>
    <i v-if="open && type === 'systemAnnouncement'" @click="hide()" class="el-icon-arrow-up icon"></i>
  </div>
</template>
<script>
import Vue from 'vue'

export const bus = new Vue()

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    type: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      open: false
    }
  },
  computed: {
    text() {
      return (
        this.data.text ||
        (this.data.messageQueuePO && this.data.messageQueuePO.message)
      )
    }
  },
  methods: {
    show() {
      this.open = true
      this.$emit('open')
    },
    hide() {
      this.open = false
    },
    setRead() {
      this.$emit('open')
    }
  },
  mounted() {
    bus.$on('refresh', () => {
      this.open = false
    })
  }
}
</script>
<style lang="scss" scoped>
.message-item {
  position: relative;
}
.item {
  display: flex;
  .dot {
    content: '';
    height: 10px;
    width: 10px;
    background: red;
    position: absolute;
    top: 25px;
    border-radius: 50%;
    left: -10px;
  }
  .left-area {
    position: relative;
    flex: 1;
    width: 100px;
    line-height: 36px;
    .title {
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }
    // &::before {
    //   position: absolute;
    //   content: '';
    //   height: 8px;
    //   width: 8px;
    //   left: -20px;
    //   top: 25px;
    //   border-radius: 4px;
    //   background: #ff506d;
    // }
  }
  .time {
    width: 150px;
    line-height: 36px;
    color: #666;
  }
}

.sub-title {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
  margin-right: 14px;
  cursor: pointer;
}

.icon {
  display: block;
  position: absolute;
  right: 0;
  bottom: 0;
  border: 1px solid grey;
  border-radius: 50%;
}
</style>

<template>
  <svg
    class="icon"
    aria-hidden="true"
    :style="{
      width,
      height
    }"
  >
    <use
      :xlink:href="realHref"
    ></use>
  </svg>
</template>

<script>
export default {
  props: {
    klass: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '16px'
    },
    height: {
      type: String,
      default: '16px'
    }
  },
  computed: {
    realHref() {
      return `#${this.klass}`
    }
  }
}
</script>

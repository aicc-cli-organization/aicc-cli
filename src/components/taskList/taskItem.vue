<template>
  <div
    @click="$emit('click')"
    class="task-item">
    <div class="title">
      <div class="left">{{name}}</div>
      <div class="right-area hover-effect">
        <slot name="status"></slot>
        <a class="icons">
          <slot name="edit"></slot>
          <slot name="delete"></slot>
        </a>
      </div>
    </div>
    <slot name="reason"></slot>
    <template v-if="$slots.progress">
      <slot name="progress"></slot>
    </template>
    <div class="progress" v-else>
      <span class="num">进度: {{complete || 0}}/{{total || 0}}</span>
      <span class="progress-wrap">
        <el-progress :percentage="progressPercent(complete, total)"
          color="#A8D4FC"
          :text-inside="true"></el-progress>
      </span>
    </div>
    <div class="creation">
      <div class="name">{{createUserName}}</div>
      <div>创建于{{createTime}}</div>
    </div>
    <em class="arrow"></em>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    complete: [String, Number],
    total: [String, Number],
    createUserName: String,
    createTime: String
  },
  methods: {
    progressPercent(completed, total) {
      completed = completed || 0
      total = total || 0
      return total ? Math.max(0, Math.min(100, Number(((completed) / (total) * 100).toFixed(2)))) : 0
    }
  }
}
</script>

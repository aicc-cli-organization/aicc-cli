<template>
  <span>
    <el-tag class="tag-button" @click.native="setDefaultGroup">
      设为默认分组
    </el-tag>
    <el-tag class="tag-button" @click.native="chooseDefaultGroup">
      选择默认分组({{groupUserList.length}}人)
    </el-tag>
  </span>
</template>

<script>
import * as taskAPI from '@/api/task'

export default {
  props: {
    groupType: {
      validator: function (value) {
        return ['WECHAT_PUSH', 'EARLY_WARNING_PUSH'].indexOf(value) !== -1
      }
    },
    value: {
      type: Array,
      default() {
        return []
      }
    },
    emptyTip: {
      validator: function (value) {
        return ['未选择微信推送人', '未选择预警消息推送人'].indexOf(value) !== -1
      }
    }
  },
  data() {
    return {
      groupUserList: []
    }
  },
  methods: {
    async getDefaultGroupInfo() {
      const res = await taskAPI.getUserPushGroupsList({ groupType: this.groupType })
      this.groupUserList = res.data.data
    },
    async setDefaultGroup() {
      if (this.value.length === 0) {
        this.$message({
          type: 'error',
          message: this.emptyTip
        })
        return
      }
      await taskAPI.addUserPushGroups({
        groupType: this.groupType,
        userInGroupIds: this.value
      })
      this.$message({
        message: '设置成功',
        type: 'success'
      })
      this.getDefaultGroupInfo()
    },
    chooseDefaultGroup() {
      this.$emit('input', this.groupUserList.map(item => item.userId))
    }
  },
  mounted() {
    this.getDefaultGroupInfo()
  }
}
</script>

<style lang="scss" scoped>
.tag-button {
  display: inline-block;
  margin: 0 10px;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>

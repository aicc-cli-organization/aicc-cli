<template>
  <span>
    <el-tag
      class="tag-button"
      @click.native="onSetDefaultGroup"
    >设为默认分组</el-tag>
    <el-tag
      class="tag-button"
      @click.native="onChooseDefaultGroup"
    >选择默认分组({{groupMemberIds.length}}人)</el-tag>
  </span>
</template>

<script>
import { getUserPushGroupsList, addUserPushGroups } from '@/api/task'

const warningMsgEnum = {
  WECHAT_PUSH: '未选择微信推送人',
  EARLY_WARNING_PUSH: '未选择预警消息推送人'
}

export default {
  props: {
    groupType: {
      validator: function(val) {
        return ['WECHAT_PUSH', 'EARLY_WARNING_PUSH'].includes(val)
      }
    },
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      groupMemberIds: []
    }
  },
  methods: {
    async onSetDefaultGroup() {
      if (!this.innerValue.length) {
        this.$message.error(warningMsgEnum[this.groupType])
        return
      }
      const res = await addUserPushGroups({
        groupType: this.groupType,
        userInGroupIds: this.innerValue
      })
      this.$message.success(res.data.data)
      this.loadGroupMembers()
    },
    onChooseDefaultGroup() {
      this.innerValue = this.groupMemberIds
    },
    async loadGroupMembers() {
      const res = await getUserPushGroupsList({
        groupType: this.groupType
      })
      this.groupMemberIds = (res.data.data || []).map(item => item.userId)
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    }
  },
  mounted() {
    this.loadGroupMembers()
  }
}
</script>

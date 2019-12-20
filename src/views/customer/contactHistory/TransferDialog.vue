<template>
  <yiwise-dialog title="转移" :visible.sync="innerVisible" class="transfer" @open="handleDialogOpen" @close="handleDialogClose" @confirm="handleSubmit">
    <div class="transfer-body">

      <!-- 转移到他人 -->
      <div class="transfer-item" :class="type === 'private' ? 'transfer-item-active' : ''" @click="handleCardClick('private')">
        <span>他人</span>
        <el-select placeholder="请选择转移人员" v-model="transferTo" class="transfer-sel">
          <el-option v-for="user in userList" :key="user.userId" :value="user.userId" :label="user.name" :disabled="userId === user.userId"></el-option>
        </el-select>
      </div>

      <!-- 转移到公海 -->
      <div class="transfer-item" :class="type === 'public' ? 'transfer-item-active' : ''" @click="handleCardClick('public')">
        <span>公海</span>
      </div>

    </div>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { getAllUserList } from '@/api/users'
  import { moveCustomerListToOtherPerson, moveCustomerListToPublicSea } from '@/api/customer'
  import { mapGetters } from 'vuex'

  export default {
    name: 'TransferDialog',
    components: {
      YiwiseDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      customerPersonIds: Array // 被转移人员id
    },
    computed: {
      ...mapGetters(['userId']),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      }
    },
    data() {
      return {
        transferTo: '', // 转移人员
        userList: [],
        type: 'private' // private私海 public公海
      }
    },
    methods: {
      handleDialogOpen() {
        this.loadUserList()
      },
      handleDialogClose() {
        this.type = 'private'
        this.transferTo = ''
      },
      handleCardClick(type) {
        this.type = type
      },
      async loadUserList() { // 加载成员列表
        try {
          const { data } = await getAllUserList({
            pageNum: 1,
            pageSize: 999
          })
          if (data && data.data) {
            this.userList = data.data
          }
        } catch (error) {
          return
        }
      },
      async handleSubmit() {
        if (this.type === 'private') {
          if (!this.transferTo) {
            this.$message.error('请选择转移人员')
            return
          }
          try {
            await moveCustomerListToOtherPerson({
              targetFollowUserId: this.transferTo,
              customerPersonIds: this.customerPersonIds
            })
          } catch (error) {
            return
          }
        } else if (this.type === 'public') {
          try {
            await moveCustomerListToPublicSea({
              customerPersonIds: this.customerPersonIds
            })
          } catch (error) {
            return
          }
        }
        this.$message.success('转移成功')
        this.$emit('success')
        this.innerVisible = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';

  .transfer {
    /deep/ .el-dialog__header {
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 65px 0!important;
    }
    .transfer-body {
      display: flex;
      justify-content: center;
      align-items: center;
      > .transfer-item {
        width: 228px;
        height: 148px;
        border: $--border-base;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        font-size: 20px;
        color: $--color-info;
        &:first-child {
          margin-right: 26px;
        }
        > .transfer-sel {
          position: absolute;
          width: 188px;
          bottom: 14px;
        }
      }
      > .transfer-item-active {
        border: 2px solid $--color-primary;
        color: $--color-primary;
      }
    }
  }
</style>


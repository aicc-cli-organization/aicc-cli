<template>
  <div class="role-management">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/systemManagement/teamManagement' }">团队管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <RoleManage appType="crm"></RoleManage>
  </div>
</template>

<script>
import { RoleManage } from 'yiwise-components'

export default {
  components: {
    RoleManage
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
  .role-management {
    height: 100%;
    display: flex;
    flex-direction: column;
    > .role {
      flex-grow: 1;
      display: flex;
      margin-top: 10px;
    }
  }
</style>

<template>
  <div class="team">
    <team-list
      class="list yw-container"
      :tree="organizationTree"
      :hasAddEditDelAccess="hasAddEditDelAccess"
      @node-click="handleNodeClick"
      @submit="loadOrganizationTree"
    >
    </team-list>
    <team-detail
      class="detail yw-container"
      :hasRoleManageAccess="hasRoleManageAccess"
      :hasUserManageAccess="hasUserManageAccess"
      :organizationId="selectOrganizationId"
    >
    </team-detail>
  </div>
</template>

<script>
  import TeamList from './teamList'
  import TeamDetail from './teamDetail.vue'
  import { getOrganizationTree } from '@/api/organizations'

  export default {
    name: 'TeamManagement',
    components: {
      TeamList,
      TeamDetail
    },
    props: {
      hasRoleManageAccess: {
        type: Boolean,
        default: false
      },
      hasUserManageAccess: {
        type: Boolean,
        default: false
      },
      hasAddEditDelAccess: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        organizationTree: [],
        selectOrganizationId: ''
      }
    },
    methods: {
      async loadOrganizationTree(initSelect = true) { // 加载组织架构树
        const { data } = await getOrganizationTree()
        if (data.data) {
          this.organizationTree = [data.data]
          if (initSelect) { // 是否重置selectId
            this.selectOrganizationId = data.data.id || 0
          }
        }
      },
      handleNodeClick(data) { // 点击组织架构改变selectId
        this.selectOrganizationId = data.id
      }
    },
    mounted() {
      this.loadOrganizationTree()
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';

  .team {
    height: 100%;
    display: flex;
    > .list {
      flex-shrink: 0;
    }
    > .detail {
      flex-grow: 1;
      margin-left: 14px;
    }
  }
</style>


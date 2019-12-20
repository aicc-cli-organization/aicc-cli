<template>
  <div class="team-list">
    <div class="title">组织架构</div>
    <div class="tree" v-if="hasAccess('crm_depart_view')">
      <el-tree
        ref="tree"
        :data="tree"
        :props="treeProps"
        node-key="id"
        :expand-on-click-node="false"
        :default-expand-all="true"
        @node-click="handleNodeClick"
      >
        <div
          slot-scope="{node, data}"
          class="tree-item"
        >
          <div class="label">{{data.name}}</div>
          <div class="action">
            <i
              class="iconfont icon-tianjiajiahaowubiankuang"
              @click.stop="() => handleAddClick(data.id)"
              v-if="hasAccess('crm_depart_addOrEditOrDel')"
            >
            </i>
            <i
              class="iconfont icon-bianji"
              @click.stop="() => handleEditClick(data.id)"
              v-if="hasAccess('crm_depart_addOrEditOrDel')"
            >
            </i>
            <yiwise-pop-confirm
              label="确认删除该部门吗？"
              v-if="hasAccess('crm_depart_addOrEditOrDel')"
              @click.native="e => e.stopPropagation()"
              @submit="() => handleDelete(data.id)"
            >
              <i class="iconfont icon-changyonggoupiaorenshanchu"></i>
            </yiwise-pop-confirm>
          </div>
        </div>
      </el-tree>
    </div>
    <department-dialog
      :visible.sync="departmentDialogVisible"
      :id="departmentId"
      :type="departmentDialogType"
      @submit="handleDepartmentChange"
    >
    </department-dialog>
  </div>
</template>

<script>
  import DepartmentDialog from './components/departmentDialog'
  import { YiwisePopConfirm } from 'yiwise-components'
  import { deleteOrganization } from '@/api/organizations'

  export default {
    name: 'TeamList',
    components: {
      DepartmentDialog,
      YiwisePopConfirm
    },
    props: {
      tree: {
        type: Array,
        default() {
          return []
        }
      }
    },
    data() {
      return {
        treeProps: {
          label: 'name',
          children: 'nodes'
        },
        departmentDialogVisible: false,
        departmentId: '',
        departmentDialogType: 'add'
      }
    },
    methods: {
      handleNodeClick(data) {
        this.$emit('node-click', data)
      },
      handleAddClick(id) { // 新增部门
        this.departmentDialogType = 'add'
        this.departmentDialogVisible = true
        this.departmentId = id || ''
      },
      handleEditClick(id) { // 编辑部门
        this.departmentDialogVisible = true
        this.departmentDialogType = 'edit'
        this.departmentId = id || ''
      },
      handleDepartmentChange() { // 部门改变时
        this.$emit('submit')
      },
      async handleDelete(id) { // 删除部门
        try {
          if (id) {
            await deleteOrganization({
              id
            })
            this.$message.success('删除成功')
            this.$emit('submit')
          }
        } catch (error) {
          return
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';

  .team-list {
    width: 338px;
    > .title {
      padding: 14px;
      border-bottom: $--border-base;
    }
    > .tree {
      /deep/ .el-tree-node {
        white-space: pre-wrap;
      }
      /deep/ .is-current > .el-tree-node__content {
        background-color: $--color-primary!important;
        color: $--color-white!important;
        > .el-tree-node__expand-icon {
          color: $--color-white!important;
        }
        > .el-tree-node__expand-icon.is-leaf {
          color: transparent!important;
        }
      }
      /deep/ .el-tree-node__content {
        padding-right: 14px;
        height: 32px;
        line-height: 1.2;
        &:hover {
          background-color: $--color-primary-light-8;
          .tree-item .action {
            opacity: 1;
          }
        }
        > .el-tree-node__expand-icon {
          display: inline-block;
          margin-left: 8px;
          color: $--color-primary;
        }
        > .el-tree-node__expand-icon.is-leaf {
          color: transparent;
        }
      }
      .tree-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        > .action {
          flex-shrink: 0;
          opacity: 0;
          transition: $--opacity-transition-base;
          .iconfont {
            display: inline-block;
            font-size: $--font-size-small;
            margin-left: 6px;
          }
        }
      }
    }
  }
</style>


<template>
  <div class="translate">
    <div class="organization">
      <div class="title">组织架构</div>
      <div class="content">
        <el-select
          v-model="innerValue"
          class="search-user"
          value-key="id"
          :multiple="true"
          :filterable="true"
          :collapse-tags="true"
          placeholder="请选择团队成员"
          @change="handleSelectChange"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :value="user"
            :label="user.name"
          >
          </el-option>
        </el-select>
        <el-tree
          class="organization-tree"
          ref="tree"
          node-key="id"
          :data="nodeList"
          :props="treeProps"
          :show-checkbox="true"
          :default-expand-all="true"
          :filter-node-method="filterNode"
          @check="handleTreeChange"
        >
        </el-tree>
      </div>
    </div>
    <div class="translate-type">
      <div class="title">分配方式</div>
      <div class="content">
        <el-radio-group
          class="radio"
          v-model="distributeType"
          @change="handleRadioChange"
        >
          <el-radio-button label="direct">直接分配</el-radio-button>
          <el-radio-button label="average">平均分配</el-radio-button>
        </el-radio-group>
        <div class="type-content">
          <div
            class="stats clearfix"
          >
            <span>待分配{{customerStr}}数：<span>{{assignCountWaited}}</span>位'</span>
            <span v-if="distributeType === 'direct'">已选择分配数量：<span>{{calcAllNumber()}}</span>位</span>
            <span v-if="distributeType === 'direct'" class="float-r">单次分配数量支持10W条</span>
          </div>
          <pagination-table
            v-if="distributeType === 'direct'"
            class="table"
            :data="innerValue"
            :isPagination="false"
            :autoLoad="false"
            :max-height="365"
          >
            <el-table-column
              prop="name"
              label="姓名"
              :show-overflow-tooltip="true"
            >
            </el-table-column>
            <el-table-column
              prop="phoneNumber"
              label="联系电话"
              width="100px"
            >
            </el-table-column>
            <el-table-column
              prop="roleName"
              label="角色"
              :show-overflow-tooltip="true"
            >
            </el-table-column>
            <el-table-column
              label="分配数量"
              width="105px"
            >
              <template slot-scope="{ row, $index }">
                <el-input-number
                  v-model="row.number"
                  :min="0"
                  :controls="false"
                  :precision="0"
                  :style="{width: '80px'}"
                  @change="() => handleInputChange(val,$index)"
                >
                </el-input-number>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="60px"
            >
              <template slot-scope="{ $index }">
                <span
                  class="delete"
                  @click="() => handleUserDelete($index)"
                >
                  删除
                </span>
              </template>
            </el-table-column>
          </pagination-table>
          <div
            v-else
          >
            已选<span>{{this.innerValue.length}}</span>人，每人分配<span>{{averageCount}}</span>条，剩余<span>{{restCount}}</span>条
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import { getOrganizationTree } from '@/api/organizations'
import { getUserList } from '@/api/users'
import { mapGetters } from 'vuex'
import { uniqBy } from '@/utils/uniqBy'

export default {
  name: 'Translate',
  components: {
    PaginationTable
  },
  props: {
    visible: { // 弹框的show/hide
      type: Boolean,
      default: false
    },
    assignCount: { // 分配数量
      type: Number,
      default: 0
    },
    disabledUserId: {} // 禁止选择的用户id
  },
  computed: {
    averageCount() { // 平均每人分配到的数量
      if (this.innerValue.length === 0) {
        return 0
      } else {
        return Math.floor(this.assignCount / this.innerValue.length)
      }
    },
    restCount() { // 剩余数量
      if (this.innerValue.length === 0) {
        return 0
      } else {
        return this.assignCount % this.innerValue.length
      }
    },
    selectedCount() { // 已选择分配数量
      return this.assignCount - this.innerAssignCount
    },
    assignCountWaited() {
      return this.assignCount
    },
    ...mapGetters(['userId', 'customerStr'])
  },
  data() {
    return {
      userList: [], // 用户列表
      treeProps: {
        label: 'name',
        children: 'nodes'
      },
      organizationTree: {},
      nodeList: [], // 组织架构数据
      distributeType: 'direct', // 分配方式 direct average
      innerValue: [], // 记录当前选中的user信息（不包括organization）
      innerAssignCount: this.assignCount
    }
  },
  watch: {
    visible(newVisible) {
      if (newVisible) {
        this.innerAssignCount = this.assignCount
        this.loadData()
      } else {
        this.innerValue = []
        this.nodeList = []
        this.userList = []
        this.innerAssignCount = 0
        this.distributeType = 'direct'
      }
    },
    assignCount(count) {
      this.innerAssignCount = count
    },
    innerValue() {
      this.innerAssignCount = this.assignCount - this.calcAllNumber()
    }
  },
  methods: {
    // async loadUser() { // 加载所有用户数据
    //   try {
    //     const { data } = await getWholeUserList()
    //     if (data.data) {
    //       const parseList = data.data.map(item => {
    //         item.isLeaf = true
    //         item.id = item.organizationId + '-' + item.userId
    //         return item
    //       })
    //       this.userList = parseList
    //       return parseList
    //     }
    //   } catch (error) {
    //     Promise.reject(error)
    //   }
    // },
    async loadOrganizationTree() { // 加载组织架构树
      try {
        const { data } = await getOrganizationTree()
        return data.data || {}
      } catch (error) {
        Promise.reject(error)
      }
    },
    async loadUser(organization) { // 按照组织架构加载所有用户
      var organizationList = []
      var userList = []
      function traverOrganizationTree(organization) {
        organizationList.push(organization)
        if (organization.nodes.length) {
          organization.nodes.forEach(it => traverOrganizationTree(it))
        }
      }
      traverOrganizationTree(organization)

      userList = (
        await Promise.all(
          organizationList.map(it => getUserList({
            organizationId: it.id,
            pages: 1,
            pageSize: 999 })
          )
        )
      ).reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue.data.data.content),
        userList
      )
      userList = uniqBy(userList, 'userId')

      const parseList = userList.map(item => {
        item.isLeaf = true
        item.id = item.organizationId + '-' + item.userId
        item.disabled = item.userId === this.disabledUserId
        return item
      })
      this.userList = parseList
      return parseList
    },
    formatNodeList(organization, userObj) { // 将组织架构树与userlist结合
      if (organization && organization.id) {
        const currentUserList = userObj[organization.id]
        if (organization.nodes) { // 存在子节点，则继续遍历
          organization.nodes.forEach(item => {
            this.formatNodeList(item, userObj)
          })
          if (currentUserList) {
            organization.nodes = organization.nodes.concat(currentUserList)
          }
        } else if (currentUserList) {
          organization.nodes = currentUserList
        }
      }
    },
    userListToObj(userList) { // 将userlist转化为obj，key为organizationId，便于插入组织
      const tempObj = {}
      userList.forEach(item => {
        if (tempObj[item.organizationId]) {
          tempObj[item.organizationId].push(item)
        } else {
          tempObj[item.organizationId] = [item]
        }
      })
      return tempObj
    },
    // loadData() {
    //   Promise.all([this.loadOrganizationTree(), this.loadUser()]).then(arr => {
    //     const organizationTree = arr[0]
    //     const userList = arr[1]
    //     this.traverOrganizationTree(organizationTree)
    //     this.formatNodeList(organizationTree, this.userListToObj(userList))
    //     this.nodeList = [organizationTree]
    //     this.$nextTick(() => {
    //     this.$refs.tree.filter() // 剔除不存在用户的部门
    //  })
    //   })
    // },
    loadData() {
      this.loadOrganizationTree().then(async organizationTree => {
        const userList = await this.loadUser(organizationTree)
        this.formatNodeList(organizationTree, this.userListToObj(userList))
        this.nodeList = [organizationTree]
        this.$nextTick(() => {
          this.$refs.tree.filter() // 剔除不存在用户的部门
        })
      })
    },
    handleUserDelete(index) { // 删除已选团队成员
      this.innerValue.splice(index, 1)
      this.$refs.tree.setCheckedNodes(this.innerValue || [])
    },
    handleTreeChange(currentNode, tree) {
      if (tree.checkedNodes) {
        let checkedNodes = tree.checkedNodes.filter(item => { // 筛选出user
          return item.userId
        })
        checkedNodes.map(item => {
          const name = item.name
          const m = this.innerValue.filter(item => item.name === name)
          if(m && m.length > 0) {
            item.number = m[0].number
          }
        })
        this.innerValue = checkedNodes
      }
    },
    handleSelectChange(selectedValue) {
      this.$refs.tree.setCheckedNodes(selectedValue || [])
    },
    filterNode(value, data) {
      if (!data.userId && (!data.nodes || data.nodes.length === 0)) {
        return false
      }
      //  else if (data.userId === this.userId) {
      //   return false
      // }
      return true
    },
    handleInputChange(val,index) { // 输入分配数量
      const innerAssignCount = this.assignCount - this.calcAllNumber()
      if(innerAssignCount < 0) { //选多了
        const minusCount = this.calcAllNumber() - this.assignCount 
        const number = this.innerValue[index].number 
        const array = {
          ...this.innerValue[index],
          number:  number - minusCount
        }
        
        this.$set(this.innerValue, index, array)
      }
    },
    calcAllNumber() { // 计算并返回已填分配数量
      return this.innerValue.reduce((num, item) => {
        if (item.number) {
          return item.number + num
        } else {
          return num
        }
      }, 0)
    },
    validate(cb) { // 验证并返回数据
      if (this.distributeType === 'direct') {
        if (this.innerAssignCount < 0) {
          this.$message.error('分配数量已超过上限')
          return cb(false)
        } else {
          const result = []
          this.innerValue.forEach(item => {
            const { number, userId } = item
            if (item.number && item.number > 0) {
              result.push({
                userId,
                number
              })
            }
          })
          if (result.length === 0) {
            this.$message.error('请至少分配给一位团队成员')
            return cb(false)
          }
          cb({
            type: 'direct',
            data: result
          })
        }
      } else {
        const result = this.innerValue.map(item => {
          return item.userId
        })
        if (result.length === 0) {
          this.$message.error('请至少分配给一位团队成员')
          return cb(false)
        }
        cb({
          type: 'average',
          data: result
        })
      }
    },
    handleRadioChange(value) { // 切换分配方式，初始化待分配客户数
      if (value === 'direct') {
        this.innerAssignCount = this.assignCount - this.calcAllNumber()
      } else {
        this.innerAssignCount = this.assignCount
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';

  .translate {
    display: flex;
    height: 500px;
    > .organization {
      width: 250px;
      flex-shrink: 0;
      display: flex;
      overflow: auto;
      flex-direction: column;
      background-color: $bodyBg;
      .search-user {
        flex-shrink: 0;
        width: 100%;
        margin-bottom: 10px;
      }
      .organization-tree {
        flex-grow: 1;
        overflow: auto;
      }
    }
    > .translate-type {
      width: 558px;
      flex-grow: 1;
      background-color: $bodyBg;
      margin-left: 14px;
      display: flex;
      flex-direction: column;
      .radio {
        align-self: center;
        flex-shrink: 0;
      }
      .type-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        > .stats {
          flex-shrink: 0;
          margin-bottom: 10px;
        }
        > .table {
          flex-grow: 1;
          .delete {
            @extend %tableAction;
          }
        }
      }
    }
    .title {
      flex-shrink: 0;
      padding: 10px 14px;
      border-bottom: $--border-base;
    }
    .content {
      flex-grow: 1;
      display: flex;
      overflow: auto;
      flex-direction: column;
      padding: 10px 14px;
    }
  }
</style>


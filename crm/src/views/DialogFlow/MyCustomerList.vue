<template>
  <new-pagination-table
    class="table"
    ref="table"
    :url="url"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :autoLoad="false"
    server="engine"
    :pageZero="false"
    :max-height="clientHeight - 420"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @selection-change="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
    style="width:100%"
  >
  <!-- @row-dblclick="handleRowDoubleClick" -->
    <el-table-column type="selection" width="40"></el-table-column>
    <el-table-column fixed prop="callRecordId" label="通话记录id" width="80"></el-table-column>
    <el-table-column label="联系电话">
      <template slot-scope="{ row }">
        {{row.calledPhoneNumber || rowData.phoneNumber || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column prop="startTime" label="呼叫时间"></el-table-column>
    <el-table-column prop="chatDuration" label="呼叫时长（秒）"></el-table-column>
    <el-table-column label="自定义变量" :show-overflow-tooltip="false">
      <template slot-scope="{ row }">
        <template v-if="!row.hasOwnProperty('properties') || Object.keys(row.properties).length == 0">{{emptyPlaceholder}}</template>
        <div v-else v-for="(value, key) in row.properties" :key="key" class="property-item">
          <span class="p-label">{{key}}:</span>
          <span>{{value || emptyPlaceholder}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="通话详情" width="120px">
      <template slot-scope="scope">
        <el-button style="position: relative" class="mr10" @click="$emit('showCallDetail', scope.row, scope.$index)" type="text" size="small">查看通话详情
          <div class="dot" v-if="scope.row.read === 'NOT_READ'"></div>
        </el-button>
      </template>
    </el-table-column>
  </new-pagination-table>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import { YiwisePopConfirm } from 'yiwise-components'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  export default {
    name: 'MyCustomerList',
    components: {
      NewPaginationTable,
      YiwisePopConfirm
    },
    props: {
      type: [String],
      url: {
        type: String,
        default: ''
      }
    },
    computed: {
      ...mapGetters(['clientHeight'])
    },
    data() {
      return {
        emptyPlaceholder
      }
    },
    methods: {
      loadData(params, cb) {
        this.$refs.table.loadData({
          ...params
        }, cb)
      },
      // handleRowDoubleClick(row) {
      //   this.$emit('preview', row)
      // },
      checkAll(checkAll) {
        this.$refs.table.checkAll(checkAll)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';

  .table {
    .operation {
      @extend %tableAction;
    }
    .property-item {
      display: inline-block;
      margin-right: 10px;
    }
  }
  .dot{
    height: 6px;
    width: 6px;
    border-radius: 3px;
    background: red;
    position: absolute;
    top: 5px;
    right: -10px;
  }
</style>


<template>
  <el-dialog
    title="外呼拦截"
    top="0"
    width="950px"
    :visible.sync="innerVisible"
    @close="close"
    @open="onOpen"
    class="waihu-dialog"
  >
   <el-dialog
    width="32%"
    title="提示"
    :visible.sync="tipsVisible"
    append-to-body>
    <span class="el-warning"><i class="el-icon-warning"></i><span>"</span><span>{{editName}}</span><span>"拦截规则处于编辑状态，是否保存</span></span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirmSave">保 存</el-button>
      <el-button type="info" plain  @click="tipsVisible = false">取 消</el-button>
    </span>
   </el-dialog>
   <div class="container">
      <div class="main-title" >以下情况实时拦截</div>
      <div class="block">
        <div class="content first" style="padding: 8px 12px">
          <div class="title first">已加入的白名单共享组</div>
          <pagination-table
            class="table"
            :data="whiteList"
            :isPagination="false"
            :autoLoad="false"
            :max-height="365"
            :border="false"
          >
            <yiwise-table-column prop="name" label="共享组名"></yiwise-table-column>
            <yiwise-table-column prop="createTime" label="加入时间"></yiwise-table-column>
            <!-- <yiwise-table-column prop="typeDesc" label="操作人"></yiwise-table-column> -->
          </pagination-table>
          <div class="tips"><span class="tips-title">属于线路限制地号码：</span><span class="tips-content">检测目标号码是否在当前使用线路的限制呼叫范围内，如在，系统将会自动拦截。</span></div>
        </div>
      </div>
      <div class="block" v-for="(item, index) in infoList" :key="item.name">
        <div class="collapse-title" @click="view(index)">
          <span v-if="!item.edit === true || item.source === 'SYSTEM'">{{item.name}}</span>
          <span @click.stop v-if="item.edit === true && item.source !== 'SYSTEM'" >
            <el-input :ref="'input'+index" 
              class="edit-name" 
              v-model="item.name" 
              :maxlength="maxNameLength" 
              placeholder="请输入内置拦截规则" 
              @change="val => nameFocus(val,index)"
              ></el-input>
          </span>
          <span class="intercept-inner" v-if="item.type === 'TENANT'">公司内部</span>
          <span class="intercept-custom" v-if="item.defaultStatus === true">默认</span>
          <div class="float-r intercept-button-wrapper" @click.stop v-if="item.source !== 'SYSTEM'">
            <el-button plain @click.stop="setDefault(index)"  :disabled="item.edit === true || item.defaultStatus === true || !isSetDefault">设为默认</el-button>
            <el-button plain @click.stop="expand(index)" :disabled="item.edit === true"><i class="iconfont icon-edited pointer"></i></el-button>
            <el-popover
              placement="left"
              width="400"
              v-model="item.popoverVisible" popper-class="delete-intercept-popover">
              <div style="padding:12px" @click="e => setVisible(e,index)">
                <p>已经确认应用该组规则的所有任务全部为"已完成"吗?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancel(index)">取消</el-button>
                  <el-button type="primary" size="mini" @click="deleted(index)">确定</el-button>
                </div>
              </div>
              <el-button plain slot="reference" @click.stop><i class="iconfont icon-delet pointer"></i></el-button>
            </el-popover>
          </div>
        </div>
        <div class="collapse-content" :class="item.edit === true && 'edit'">
          <div class="content-wrapper" style="padding-bottom: 15px; border-bottom: 1px solid #e5e5e5">
            <span class="title" style="margin-top: -3px">数据统计范围</span>
            <el-radio-group v-model="item.type" :disabled="item.source === 'SYSTEM'">
              <el-radio label="ALL">全网</el-radio>
              <el-radio label="TENANT">公司内部</el-radio>
            </el-radio-group>
            <el-tooltip effect="dark" placement="top-start">   
              <div slot="content">全网：对本平台所有CRM账号的外呼数据统计<br />公司内部：对本公司名下CRM主账号及子账号的外呼数据统计</div>
              <i class="el-icon-question icon-tip"></i>
            </el-tooltip>
          </div>
          <div class="content-wrapper" style="border-top:none;margin-bottom:15px">
            <span class="title">外呼上限设置</span>
            <span style="flex:1">
              <div class=" clearfix">
                <div class="self-adapt">
                  <el-select
                    v-model="item.callOutDays"
                    placeholder="请选择检测时间"
                    class="select1"
                    :disabled="item.callOutRestrict !== 'YES' || item.source === 'SYSTEM'"
                    @change="callOutDaysChange"
                  >
                    <el-option
                      v-for="day in [1, 3, 7, 14]"
                      :key="day"
                      :value="day"
                      :label="day"
                    />
                  </el-select>
                  <span class="text">天内限制</span>
                  <el-select
                    v-model="item.callOutCount"
                    placeholder="请选择外呼次数上限"
                    class="select2"
                    :disabled="item.callOutRestrict !== 'YES' || item.source === 'SYSTEM'"
                    @change="callOutCountChange"
                  >
                    <el-option
                      v-for="count in callOutCountList"
                      :key="count"
                      :value="count"
                      :label="count"
                    />
                  </el-select>
                  <span class="text">次</span>
                  <el-switch :disabled="item.source === 'SYSTEM'" class="float-r"  active-value="YES" inactive-value="NO" v-model="item.callOutRestrict" @change="val => handleCallOutRestrictChange(val,index)" />
                </div>
              </div>
            </span>
          </div>
          <div class="content-wrapper" style="border-bottom:1px solid #e5e5e5">
            <span class="title">号码异常检测</span>
            <span style="flex:1">
              <div class="content-item clearfix">
                <div class="self-adapt">
                  <el-select
                    v-model="item.notExistDays"
                    placeholder="请选择检测时间"
                    class="select1"
                    :disabled="item.phoneNumberAbnormal !== 'YES' || item.source === 'SYSTEM'"
                    @change="notExistDaysChange"
                  >
                    <el-option
                      v-for="day in [1, 2, 3, 7]"
                      :key="day"
                      :value="day"
                      :label="day"
                    />
                  </el-select>
                  <span class="text">天内号码为空号</span>
                </div>
                <el-switch  :disabled="item.source === 'SYSTEM'" active-value="YES" inactive-value="NO" v-model="item.phoneNumberAbnormal" @change=" val => handlePhoneNumberAbnormalChange(val,index)" />
              </div>
              <div class="content-item second clearfix">
                <div class="self-adapt">
                  <el-select
                    v-model="item.notServiceDays"
                    placeholder="请选择检测时间"
                    class="select1"
                    :disabled="item.phoneNumberLocation !== 'YES' || item.source === 'SYSTEM'"
                    @change="notServiceDaysChange"
                  >
                    <el-option
                      v-for="day in [1, 2, 3]"
                      :key="day"
                      :value="day"
                      :label="day"
                    />
                  </el-select>
                  <span class="text">天内手机停机</span>
                </div>
                <el-switch :disabled="item.source === 'SYSTEM'" active-value="YES" inactive-value="NO" v-model="item.phoneNumberLocation" @change="val => handlePhoneNumberLocationChange(val,index)" />
              </div>
            </span>
          </div>
          <div class="float-r operation-button" style="padding-top:10px" v-if="item.source !== 'SYSTEM'">
            <el-button type="primary" v-if="item.edit === true" @click="save(index)">保存</el-button>
            <el-button type="info" plain v-if="item.edit === true"  @click="shrink(index)">取消</el-button>
          </div>
        </div>
      </div>
      <el-button style="margin:15px 0px" type="primary" @click="add"><i class="el-icon-plus"></i>新增规则</el-button> 
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { PaginationTable, YiwiseTableColumn } from 'yiwise-components'
import { getInterceptInfo, updateIntercept, selectPolicyList, setDefaultTenantIntercept, deleteTenantIntercept } from '@/api/users'

export default {
  components: {
    PaginationTable,
    YiwiseTableColumn
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
   data() {
    return {
      whiteList: [],
      interceptLoading: false,
      infoObj: {},
      initialInfoObj: {},
      visible: false,
      svgSrc: '/static/img/hujiaolangjie.svg',
      activeNames: [],
      maxNameLength: 10,
      oldInfoList:[],
      infoList:[],
      defaultNameIndex: 1, //默认名称后缀,
      isSetDefault: true,
      popoverVisible:false,
      tipsVisible: false,
      editIndex: -1,
      editIName: ""
    }
  },
  computed: {
    ...mapGetters(['tenantId', 'customerStr']),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    callOutCountList() {
      return new Array(3 * (this.infoObj.callOutDays || 1)).fill(1).map((v, k) => k + 1)
    }
  },
  methods: {
    onOpen() {
      this.initData()
    },
    close() {
      this.infoList.map(item => item.edit = false)
    },
    setVisible(e,index) {
      this.visible = true
      e.stopPropagation()
    },
    expand(index) {
      if(this.isEditing(index)){
        return
      }
      this.infoList.map(item => item.edit = false)
      this.infoList[index].edit = true
      this.$nextTick(() => {
        this.$refs['input'+index][0].$refs.input.focus()
      })
    },
    view(index) {
      if(this.isEditing(index)){
        return
      }
      if(this.infoList[index].edit) {
        this.shrink(index)
      }else {
        this.expand(index)
      }
    },
    shrink(index) {
      if(!this.infoList[index].tenantCallInterceptId) { //新增的取消后等于删除
        this.infoList.splice(index,1)
        this.oldInfoList.splice(index,1)
        return
      }
      this.infoList[index].edit = false
      const oldObj = JSON.parse(JSON.stringify(this.oldInfoList[index]))
      oldObj.defaultStatus = this.infoList[index].defaultStatus
      this.$set(this.infoList, index, oldObj)
    },
    save(index) {
      if(this.infoList[index].name === '') {
        this.$message.error('名称不得为空')
        return
      }
      const num = this.infoList.filter(item => item.name === this.infoList[index].name).length 
      if(num > 1) {
        this.$message.error('已存在该名称')
        return
      }

      const infoObj = this.infoList[index] 
      if(infoObj.callOutRestrict === 'NO' &&  infoObj.phoneNumberAbnormal === 'NO' && infoObj.phoneNumberLocation === 'NO') {
        this.$message.error('请至少设置一个拦截项')
        return
      }
      this.infoList[index].edit = false
      this.handleIntercept(index)
    },
    confirmSave() {
      this.tipsVisible = false
      this.save(this.editIndex)
    },
    async setDefault(index) {
      if(this.isEditing(index)){
        return
      }
      this.isEditing(index)
      this.infoList.map(item => item.defaultStatus = false)
      this.infoList[index].defaultStatus = true
      await setDefaultTenantIntercept({tenantCallInterceptId:this.infoList[index].tenantCallInterceptId})
      this.$message.success('设置成功')
    },
    add() {
      if(this.isEditing(-1)){
        return
      }
      if(this.infoList.length >= this.maxNameLength) {
        this.$message.error('CRM最多可持有10个不同规则')
        return 
      }
      this.infoList.map(item => item.edit = false)
      const newObj = {
        name: '拦截规则'+ this.defaultNameIndex,
        defaultStatus: false,
        edit: true,
        popoverVisible:false,
        type: 'ALL',
        callOutRestrict: 'No',
        phoneNumberAbnormal: 'No',
        phoneNumberLocation: 'No',
      }
      this.infoList.push(newObj)
      this.oldInfoList.push(newObj)
      this.defaultNameIndex ++
      this.$nextTick(() => {
        const dialogContent = document.querySelector(".waihu-dialog .el-dialog__body")
        dialogContent.scrollTop = dialogContent.scrollHeight
      })

    },
    cancel(index) {
      this.infoList[index].popoverVisible = false
    },
    isEditing(index) {
      let editIndex = -1
      this.infoList.map((item,index) => {
        if(item.edit === true) {
          editIndex = index
        }
      })
      if(editIndex > -1 && this.infoList[editIndex].source === 'SYSTEM') {
        return false
      }
      if(editIndex > -1 && editIndex !== index ) {
        this.tipsVisible = true
        this.editIndex = editIndex
        this.editName = this.infoList[editIndex].name
        return true
      }
      return false
    },
    async deleted (index) {
      if(this.isEditing(index)){
        return
      }
      this.infoList[index].popoverVisible = false
      if(!this.infoList[index].tenantCallInterceptId) {
        this.infoList.splice(index,1)
        return
      }else {
        await deleteTenantIntercept(({tenantCallInterceptId:this.infoList[index].tenantCallInterceptId}))
        this.$message.success('删除成功')
        this.getInterceptInfoList()
      }
    },
    nameFocus(val,index) {
      this.$nextTick(() => {
        this.$refs['input'+index][0].$refs.input.focus()
      })
    },
    async initData() {
      // 加载白名单
      const res = await selectPolicyList({
        pageSize: 9999,
        pageNum: 1,
        tenantId: this.tenantId,
        joinStatus: 'JOIN'
      })
      this.whiteList = res.data.data.content || []
      this.getInterceptInfoList()
    },
    async getInterceptInfoList() {
      // 获取表单数据
      const { data } = await getInterceptInfo()
      this.infoList = data.data.map(item => ({
        ...item,
        edit : false,
        popoverVisible:false,
        phoneNumberAbnormal: item.notExistDays !== 0 ? 'YES' : 'NO',
        phoneNumberLocation: item.notServiceDays !== 0 ? 'YES' : 'NO',
        notExistDays : item.notExistDays !== 0 ? item.notExistDays : null,
        notServiceDays : item.notServiceDays !== 0 ? item.notServiceDays : null,
        callOutCount :  item.callOutCount !== 0 ? item.callOutCount : ( item.callOutRestrict === 'YES' ? 1 : null ),
        callOutDays : item.callOutDays !== 0 ? item.callOutDays : ( item.callOutRestrict === 'YES' ? 3 : null )
      }))
      this.oldInfoList = JSON.parse(JSON.stringify(this.infoList))
      if(this.infoList.filter( item => item.source === 'SYSTEM').length > 0 ) {
        this.isSetDefault = false
      }else {
        this.isSetDefault = true
      }
    },
    async handleIntercept(index) {
      const infoList = [this.infoList[index]].map(item => ({
        ...item,
        notExistDays : item.notExistDays ? item.notExistDays : 0,
        notServiceDays : item.notServiceDays  ? item.notServiceDays : 0,
        callOutCount : item.callOutCount  ? item.callOutCount : 0,
        callOutDays : item.callOutDays  ? item.callOutDays : 0
      }))
      await updateIntercept(infoList[0])
      this.$message({
        message: `保存成功，更新后的规则对任务内新导入的${this.customerStr}生效`,
        type: 'success',
        duration: 1500
      })
      this.getInterceptInfoList()
    },
    callOutDaysChange(v) {
      this.infoObj = {
        ...this.infoObj,
        callOutDays: v 
      }
    },
    callOutCountChange(v) {
      this.infoObj = {
        ...this.infoObj,
        callOutCount: v 
      }
    },
    notExistDaysChange(v) {
      this.infoObj = {
        ...this.infoObj,
        notExistDays: v 
      }
    },
    notServiceDaysChange(v) {
      this.infoObj = {
        ...this.infoObj,
        notServiceDays: v 
      }
    },
    handleCallOutRestrictChange(val,index) {
      this.infoList[index].callOutDays = val === 'YES' ? this.infoList[index].callOutDays || 1 : undefined,
      this.infoList[index].callOutCount = val === 'YES' ? this.infoList[index].callOutCount || 3 : undefined
    },
    handlePhoneNumberAbnormalChange(val,index) {
      this.infoList[index].notExistDays = val === 'YES' ? this.infoList[index].notExistDays || 3 : undefined
    },
    handlePhoneNumberLocationChange(val,index) {
      this.infoList[index].notServiceDays = val === 'YES' ? this.infoList[index].notServiceDays || 1 : undefined
    }
  }
  
}
</script>
<style lang="css" scoped>
  @keyframes intercept-dialog-fade-in {
    0% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
    100% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @keyframes intercept-dialog-fade-out {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    100% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
  }
  .waihu-dialog.dialog-fade-enter-active {
    animation: intercept-dialog-fade-in .3s;
  }
  .waihu-dialog.dialog-fade-leave-active {
    animation: intercept-dialog-fade-out .3s;
  }
</style>
<style lang="scss" scoped>
@import "src/styles/mixin.scss";
@import 'src/styles/variables.scss';
$color-border: #D8D8D8;
.icon-class {
  cursor: pointer;
  margin-right: 40px;
  &:hover {
    .iconfont {
      color: $--color-primary;
    }
  }
}
/deep/ .el-dialog__header {
  line-height: 45px;
}
.el-icon-warning {
  color:#F4AC10;
  margin-right: 8px;
  font-size: 16px;
}
.el-warning {
  display: inline-block;
  font-size: 14px;
  margin-top: 35px;
  margin-bottom: 50px;
}
.waihu-dialog /deep/ .el-dialog {
  float: right;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .el-dialog__header {
    margin-bottom: 0;
    padding: 0 24px;
    line-height: 50px;
    background-color: white;
    border-bottom: 1px solid #D8D8D8;
  }
  .el-dialog__body {
    padding: 0 !important;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    @include transparentScrollBar();
    @include elSwitch();
    .container {
      max-height: 1080px;
      overflow: auto;
      padding: 0 31px 0 20px;
      font-family: "PingFangSC-Medium", "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif !important;
      .main-title {
        margin-top:16px;
      }
      /deep/ .el-collapse-item .el-icon-arrow-right {
        display: none;
      }
      /deep/ .el-collapse-item.is-disabled .el-collapse-item__header {
        color: #333;
        cursor: auto;
      }
      /deep/ .el-collapse-item__header {
        position: relative;
      }
      /deep/ .el-button + .el-button {
        margin-left: 0;
      }
      /deep/ .el-collapse-item__content {
        padding: 0px 15px;
      }
      /deep/ .el-button i {
        margin-right: 5px;
      }
      .collapse-title {
        height: 60px;
        line-height: 60px;
        font-size: 14px;
        font-weight:500;
        cursor: pointer;
      }
      .intercept-inner, .intercept-custom {
        font-size: 12px;
        color: #fff;
        padding: 2px 8px;
        border-radius: 10px;
      }
      .intercept-custom {
        background: #1890FF;
      }
      .intercept-inner {
        background: #2AA52F;
      }
      .collapse-title, .collapse-content {
        width: 100%;
        padding: 0px 15px;
        .content-wrapper {
          display: flex;
          border-top:1px solid #e5e5e5;
          padding-top: 20px;
          span.title {
            display: inline-block;
            width: 100px;
            text-align: right;
            margin-right: 16px;
          }
        }
        .icon-tip {
          font-size: 14px;
          margin-left: 12px;
          vertical-align: -1px;
        }
      }
      .intercept-button-wrapper {
        .el-button.is-plain {
          margin-left: -7px;
          border-radius: 0px;
        }
        .el-button.is-plain:nth-of-type(1) {
          border-radius: 4px 0 0 4px;
        }
        .el-button.is-plain:nth-last-of-type(1) {
          border-radius: 0 4px 4px 0;
        }
        .el-button.is-plain:hover {
          border-color: #d8d8d8;
        }
      }
      .collapse-content {
        height: 0;
        overflow: hidden;
        transition: height 0.5s ease;
        -webkit-transition: height 0.5s ease;
      }
      .collapse-content.edit {
        height: 310px;
      }
      .title-input {
        display: inline-block;
        min-width: 100px;
        padding-bottom: 4px;
        border-bottom: 1px solid #666;
      }
      .edit-name {
        display: inline-block;
        width: 200px;
        /deep/ .el-input__inner {
          border: none;
          border-bottom: 1px solid #d8d8d8;
          border-radius: 0;
        }
      }
      .operation-button {
        .el-button {
          padding: 0 16px !important
        }
        .el-button + .el-button {
          margin-left: 8px;
        }
      }
      .block {
        margin-top: 20px;
        box-shadow:0px 1px 3px 0px #D8D8D8;
        .title {
          font-size: 14px;
          color: $--color-text-primary;
          line-height: 20px;
          font-weight: 400;
          &.first {
            margin: 8px auto;
          }
        }
        .tips {
          margin-top:16px;
          border-top: 1px solid #E7E7E7;
          padding: 16px 0px;
          .tips-title {
            font-weight:bold;
          }
          .tips-content {
            font-size: 12px;
          }
        }
        .content-item {
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 15px;
        }
        .content-item.second {
          padding-top: 15px;
          border-bottom:none;
        }
        .content {
          margin-top: 8px;
          background: #fff;
          border-radius: 4px;
          &-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .self-adapt {
              flex: 1;
              font-size: 0;
            }
            .select1 {
              width: 172px;
            }
            .select2 {
              width: 230px;
            }
            .text {
              margin: 0 18px 0 9px;
              font-size: 12px;
              color: $--color-text-primary;
            }
            .tip {
              font-size: 12px;
              color: $--color-text-primary;
            }
          }
          /deep/ {
            .el-input {
              .el-input__inner {
                background: rgba(240,240,240,1);
                border-radius: 4px;
                border: none;
                &::-webkit-input-placeholder {
                  color: $--color-text-regular;
                }
              }
              &.is-disabled {
                .el-input__inner {
                  &::-webkit-input-placeholder {
                    color: #d3d4de;
                  }
                }
              }
            }  
          }
          .table {
            border: none;
            /deep/ {
              .el-table::before {
                height: 0;
              }
              th {
                border-color: #D0D6E2;
                height: 46px;
                .cell {
                  font-size: 14px;
                  line-height: 1;
                  color: $--color-text-primary;
                }
              }
              td {
                height: 44px;
              }
              .el-table--border {
                border: none;
                &::after {
                  right: -1px;
                }
              }
              .el-table__header-wrapper {
                border-left: 1px solid #D0D6E2;
                border-right: 1px solid #D0D6E2;
              }
              .el-table__body-wrapper {
                border-left: 1px solid #e7ebf1;
                border-right: 1px solid #e7ebf1;
              }
              .el-table__empty-block {
                border: 1px solid #e7ebf1;
                border-top: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>

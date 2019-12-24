<template>
  <el-dialog
    title="批量导入"
    v-bind="$attrs"
    :visible.sync="innerVisible"
    width="600px"
    @close="close">
    <el-row>
      <el-row>
        <span>第一步：填写批量导入的{{customerStr}}模板文件</span>
        <el-button size="mini ml30">
          <a :href="csvTemplateUrl">下载模板</a>
        </el-button>
      </el-row>
      <el-upload
        class="upload-demo"
        ref="upload"
        action="/apiPlatform/file/upload"
        :headers="headers"
        :limit="1"
        :on-success="uploadSuccess"
        :data="uploadData"
        :accept="'.xlsx'"
        :auto-upload="true"
        :file-list="fileList">
        <el-row class="mt20">
          <span>第二步：上传文件</span>
          <el-button size="mini ml30">点击上传文件</el-button>
        </el-row>
        <div slot="tip" class="el-upload__tip mt20 mb20">只能上传excel文件，且不超过50万行</div>
      </el-upload>
      <div class="form-item">
        <span class="label">打乱顺序：</span>
        <el-radio-group v-model="needRearrange">
          <el-radio :label="false">否</el-radio>
          <el-radio :label="true">是</el-radio>
        </el-radio-group>
      </div>
      <div class="form-item mt15">
        <span class="label">归属地筛选：</span>
        <el-switch
          v-model="locationAnalysis">
        </el-switch>
        <el-cascader
          v-if="locationAnalysis"
          :options="provinces"
          v-model="area"
          class="ml10 mb10"
          @active-item-change="handleItemChange"
          @change="handleAreaChange"
        ></el-cascader>
        <div class="tags-con">
          <el-tag
            v-for="(addr, index) in areas"
            :key="index"
            closable
            @close="handleCloseTag(index)"
          >
            {{addr[0] + '/' + addr[1]}}
          </el-tag>
        </div>
      </div>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" :disabled="buttonDisabled" @click="submitUpload">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import * as csvAPI from '@/api/csv'
  import * as auth from '@/utils/auth'
  import { getFreeSwitchIP } from '@/api/login'
  import { mapGetters } from 'vuex'

  export default {
    components: {
    },
    props: {
      customerPersonListType: {
        type: String,
        default: 'PRIVATE_LIST'
      },
      visible: {
        type: Boolean,
        default: false
      },
      csvType: {
        type: String,
        default: 'CustomerPerson'
      },
      robotCallJobId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        csvTemplateUrl: '',
        fileList: [],
        res: {},
        buttonDisabled: true,
        needRearrange: false,
        locationAnalysis: false,
        provinces: [],
        area: [],
        areas: []
      }
    },
    computed: {
      ...mapGetters([
        'isLocal', 'customerStr'
      ]),
      uploadData() {
        return {
          isPermanent: false,
          expireTime: 7,
          checkExcel: true
        }
      },
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      headers() {
        return {
          Authorization: auth.getToken()
        }
      }
    },
    mounted() {
      this.getCitys()
      this.getCsvTemplate()
      this.buttonDisabled = true
    },
    destroyed() {
      this.$emit('update:visible', false)
      this.fileList = []
      this.buttonDisabled = true
    },
    methods: {
      async handleItemChange(addr) {
        if (!addr || !addr.length) return
        const province = addr[0]
        const item = this.provinces.find(item => item.value === province)

        if (item && !item.children.length) {
          const { data } = await csvAPI.getCitiesByProvince({
            province
          })
          item.children = (data.data || []).map(item => ({
            value: item,
            label: item
          }))
        } 
      },
      handleAreaChange(v) {
        if (!v || !v.length) return
        const addr = this.areas.find(area => area[0] === v[0] && area[1] === v[1])
        if (!addr) {
          this.areas.push([...v])
        }
      },
      handleCloseTag(index) {
        this.areas.splice(index, 1)
      },
      async getCitys() {
        const { data } = await csvAPI.getProvinces()
        this.provinces = (data.data || []).map(item => ({
          value: item,
          label: item,
          children: []
        }))
      },
      async getCsvTemplate() {
        let csvTemplateUrl = 'https://ai-call-platform.oss-cn-hangzhou.aliyuncs.com/common/导入模板.xlsx'
        if (this.isLocal) {
          const params = await getFreeSwitchIP()
          csvTemplateUrl = params.importTemplateUrl
        } else if(this.robotCallJobId) {
          // 如果是呼叫任务的导入
          const { data } = await csvAPI.getCsvTemplate({
            robotCallJobId: this.robotCallJobId || '',
            csvType: this.csvType
          })
          csvTemplateUrl = data.data
        } else {
          // 我的客户、客户公海
          const { data } = await csvAPI.getCsvTemplateNew({
            customerPersonList: this.customerPersonListType
          })
          csvTemplateUrl = data.data
        }

        this.csvTemplateUrl = csvTemplateUrl
      },
      async uploadSuccess(res) {
        if (res.code !== 200) {
          this.$refs.upload.clearFiles()
          this.$message({
            message: res.resultMsg,
            type: 'error'
          })
          return
        }
        this.res = res
        this.buttonDisabled = false
      },
      close() {
        this.$emit('update:visible', false)
        this.fileList = []
        this.locationAnalysis = false
        this.area = []
        this.areas = []
      },
      async submitUpload() {
        try {
          const params = {
            robotCallJobId: this.robotCallJobId,
            csvType: this.csvType,
            objectName: this.res.data.relativeURL,
            customerPersonListType: this.customerPersonListType,
            needRearrange: this.needRearrange,
            locationAnalysis: this.locationAnalysis,
            provinceStr: this.areas.filter(item => item[1] === '全省').map(item => item[0]).join(','),
            cityStr: this.areas.filter(item => item[1] !== '全省').map(item => item[1]).join(',')
          }
          const { data } = this.csvType === 'User'
            ? await csvAPI.uploadUserCsv()
            : (this.robotCallJobId
              ? await csvAPI.customerPersonToRobotCallJob(params)
              : await csvAPI.uploadCustomerPersonCsv(params))
          if (data.code === 200) {
            this.$message.success('上传成功，请在顶栏导入导出列表查看')
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          } else {
            this.$message({
              message: '导出失败',
              type: 'error'
            })
          }
          this.$emit('update')
          this.close()
        } catch (error) {
          return
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body{
  padding: 0 15% 20px 15% !important;
}
.tags-con {
  white-space: normal;
  .el-tag {
    font-size: 12px;
    height: 28px;
    line-height: 26px;
    margin: 5px 5px 0 0;
    /deep/ .el-tag__close {
      top: 0;
    }
    // & + .el-tag {
    //   margin-left: 5px;
    // }
  }
}
</style>

<template>
  <el-dialog
    title="Excel导入"
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
        <div slot="tip" class="el-upload__tip mt20 mb20">只能上传excel文件，且不超过10万行</div>
      </el-upload>
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
  import { mapGetters } from 'vuex'

  export default {
    components: {
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      smsJobId: {
        type: Number,
        default: null
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
      this.buttonDisabled = true
    },
    destroyed() {
      this.$emit('update:visible', false)
      this.fileList = []
      this.buttonDisabled = true
    },
    methods: {
      async getCsvTemplate() {
        if (this.smsJobId) {
          csvAPI.getSmsExcelTemplate(this.smsJobId)
            .then(({ data }) => {
              this.csvTemplateUrl = data.data
            })
        }
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
      },
      async submitUpload() {
        try {
          const params = {
            smsJobId: this.smsJobId,
            objectName: this.res.data.relativeURL
          }
          const { data } = await csvAPI.smsJobExceImport(params)
          if (data.code === 200) {
            this.$message.success('上传成功，请在顶栏导入导出列表查看')
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          } else {
            this.$message({
              message: '导出失败',
              type: 'error'
            })
          }
          this.$emit('importSuccess')
          this.close()
        } catch (error) {
          return
        }
      }
    },
    data() {
      return {
        csvTemplateUrl: '',
        fileList: [],
        res: {},
        buttonDisabled: true
      }
    },
    watch: {
      innerVisible: {
        handler: function (newVal) {
          if (newVal) {
            this.getCsvTemplate()
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 0 15% 20px 15% !important;
}
</style>

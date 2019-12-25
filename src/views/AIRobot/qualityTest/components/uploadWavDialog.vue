<template>
  <el-dialog
    title="上传录音文件"
    v-bind="$attrs"
    :visible.sync="innerVisible"
    width="600px"
    @close="close">
    <el-row>
      <el-upload
        class="upload-demo"
        ref="upload"
        action="/apiPlatform/file/upload"
        :headers="headers"
        :on-success="uploadSuccess"
        :data="uploadData"
        :accept="'.wav'"
        :auto-upload="true"
        :before-upload="beforeUpload"
        :multiple="true"
        :file-list="fileList">
        <el-row>
          <span>上传文件</span>
          <el-button size="mini">点击上传文件</el-button>
        </el-row>
        <div slot="tip" class="el-upload__tip">只能上传wav文件</div>
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
      qcJobId: {
        type: Number,
        default: null
      }
    },
    computed: {
      ...mapGetters([
        'isLocal'
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
      this.innerVisible = false
      this.fileList = []
      this.buttonDisabled = true
    },
    methods: {
      beforeUpload(file) {
        const fileName = file.name.substring(0, file.name.indexOf('.wav'))
        if (/^[\u4e00-\u9fa5_a-zA-Z0-9\.]+$/.test(fileName)) {
          return true
        }
        this.$message({
          message: '文件名不合法，只能包含英文字母、数字、中文，下划线的任意一种或多钟',
          type: 'error'
        })
        return false
      },
      async uploadSuccess(res, file, fileList) {
        if (res.code !== 200) {
          this.$refs.upload.clearFiles()
          this.$message({
            message: res.resultMsg,
            type: 'error'
          })
          return
        }
        this.urlList = fileList.map(item => {
          // relativeURL
          return item.response ? item.response.data.fullURL : undefined
        })
        this.buttonDisabled = false
      },
      close() {
        this.innerVisible = false
        this.fileList = []
      },
      async submitUpload() {
        try {
          const params = {
            qcJobId: this.qcJobId,
            urlList: this.urlList
          }
          const { data } = await csvAPI.uploadQCJobRecord(params)
          if (data.code === 200) {
            this.$message({
              message: '上传成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '上传失败',
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
        fileList: [],
        buttonDisabled: true
      }
    }
  }
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 0 15% 20px 15% !important;
}
</style>

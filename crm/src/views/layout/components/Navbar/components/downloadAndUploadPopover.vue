<template>
  <el-popover
    class="download-and-upload-popover relative"
    :style="auth_warnMsg_view || auth_sysMsg_view ? '' : 'margin-right: 0'"
    width="760"
    trigger="click">
    <download-and-upload ref="downloadAndUpload"></download-and-upload>
    <div slot="reference"
      @click="requestDownloadAndUploadList()">
      <i class="iconfont icon-shangchuanxiazaix"></i>
      <div class="dot" v-show="showDownloadAndUploadDot"></div>
    </div>
  </el-popover>
</template>
<script>

import { mapGetters } from 'vuex'
import downloadAndUpload from '@/components/downloadAndUpload'

export default {
  components: {
    downloadAndUpload
  },
  computed: {
    ...mapGetters([
      'showDownloadAndUploadDot',
      'auth_warnMsg_view',
      'auth_sysMsg_view'
    ])
  },
  methods: {
    requestDownloadAndUploadList() {
      this.$store.commit('HIDE_DOWNLOAD_AND_UPLOAD_DOT')
      this.$refs.downloadAndUpload.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.download-and-upload-popover {
  cursor: pointer;
  margin-right: 40px;
  &:hover {
    .iconfont {
      color: $--color-primary;
    }
  }
}
/deep/ .el-popover {
  position: absolute;
  background: #fff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 0px;
  z-index: 2000;
  color: #666;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.dot{
  height: 6px;
  width: 6px;
  border-radius: 5px;
  background: red;
  position: absolute;
  top: -5px;
  right: -5px;
}
.icon-yunshangchuan {
    display: block;
    position: relative;
}
.popoverImg {
  position: relative;
  display: block;
  height: 40px;
  width: 40px;
}
.download-and-upload-button {
  height: 59px!important;
  position: relative;
  border: none;
  background-color: #fff;
}
</style>

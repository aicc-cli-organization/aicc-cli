<template>
  <DragDialog
    :visible.sync="innerVisible"
    class="knowledge-modal"
  >
    <template slot="title">探意知识库</template>
    <template slot="body">
      <div class="filter">
        <el-select
          v-model="dialogFlowId"
          placeholder="选择话术"
          class="select"
          :filterable="true"
        >
          <el-option
            v-for="item in dialogFlowList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          >
          </el-option>
        </el-select>
        <search-input
          v-model="searchValue"
          placeholder="请输入标题、问法、答案、关键词"
          @search="handleKnowledgeSearch"
        >
        </search-input>
      </div>
      <div class="content">
        <collapse-item
          v-for="knowledge in knowledgeList"
          :key="knowledge.id"
          :title="knowledge.title"
          :answer="knowledge.robotKnowledgeAnswers && knowledge.robotKnowledgeAnswers[0] ? knowledge.robotKnowledgeAnswers[0].text : ''"
          class="item"
        >
        </collapse-item>
      </div>
    </template>
  </DragDialog>
</template>

<script>
import DragDialog from '@/components/DragDialog'
import { SearchInput } from 'yiwise-components'
import CollapseItem from './CollapseItem'
import { fetchFlowList, fetchKnowledgeList } from '@/api/talk'
import { mapGetters } from 'vuex'

export default {
  name: 'KnowledgeModal',
  components: {
    SearchInput,
    CollapseItem,
    DragDialog
  },
  computed: {
    innerVisible: {
      get() {
        return this.$store.getters.knowledgeModalVisible
      },
      set(newVisible) {
        this.$store.commit('SET_KNOWLEDGE_MODAL_VISIBLE', newVisible)
      }
    },
    ...mapGetters([
      'fsStatus',
      'assistantDialogFlowId',
      'useAiAssistant',
      'artiJoinModalType',
      'callType',
      'artiJoinModalData'
    ])
  },
  data() {
    return {
      dialogFlowId: undefined,
      dialogFlowList: [],
      searchValue: undefined,
      knowledgeList: []
    }
  },
  watch: {
    innerVisible(newVisible) {
      if (newVisible) {
        this.loadDialogFlowList()
      }
    },
    fsStatus(newStatus) {
      if (newStatus === 1 && this.useAiAssistant) { // 有新的会话生成
        this.dialogFlowId = this.assistantDialogFlowId
        this.innerVisible = true
      }
    },
    dialogFlowId(newId) {
      this.loadKnowledgeList(newId, this.searchValue)
    },
    artiJoinModalType(newType) { // 介入时若进入切入状态则弹出知识库
      if (this.callType === 'join') {
        this.dialogFlowId = this.artiJoinModalData.dialogFlowId
        this.innerVisible = true
      }
    }
  },
  methods: {
    async loadDialogFlowList(name) { // 加载话术列表
      const { data } = await fetchFlowList({
        pgaeNum: 1,
        pageSize: 100
      })
      if (data.data) {
        this.dialogFlowList = data.data.content || []
      }
    },
    async loadKnowledgeList(dialogFlowId, regex) { // 加载问答知识列表
      const { data } = await fetchKnowledgeList({
        pgaeNum: 1,
        pageSize: 100,
        dialogFlowId,
        regex,
        type: 'BUSINESS'
      })
      if (data.data) {
        this.knowledgeList = data.data.content || []
      }
    },
    async handleKnowledgeSearch() {
      if (!this.dialogFlowId) {
        this.$message.error('请先选择话术')
      }
      this.loadKnowledgeList(this.dialogFlowId, this.searchValue)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';

  .knowledge-modal {
    .filter {
      display: flex;
      padding: 6px 14px;
      border-bottom: $--border-base;
      > .select {
        margin-right: 10px;
      }
    }
    .content {
      padding: 14px;
      height: 531px;
      overflow: auto;
      > .item {
        &:nth-of-type(n + 2) {
          margin-top: 10px;
        }
      }
    }
  }
</style>

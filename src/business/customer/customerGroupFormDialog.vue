<template>
    <yiwise-dialog
      :title="`新建${customerStr}分组`"
      width="620px"
      :visible.sync="innerVisible"
      @close="close()"
      @confirm="addCustomerGroup"
    >
      <el-form
        :model="customerGroupForm"
        ref="customerGroupForm"
        :rules="customerGroupFormRules">
        <el-form-item :label="`${customerStr}分组名称`" prop="name" label-width="120px" class="is-required">
          <el-input v-model="customerGroupForm.name" auto-complete="on"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="comment" label-width="120px">
          <el-input v-model="customerGroupForm.comment"></el-input>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
</template>
<script>
import * as customerAPI from '@/api/customer'
import { YiwiseDialog } from 'yiwise-components'
import { mapGetters } from 'vuex'

export default {
  components: {
    YiwiseDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validator = (rule, value, cb) => {
      if (!value) {
        cb(new Error(`请输入${this.customerStr}分组名称`))
      } else {
        cb()
      }
    }

    return {
      customerGroupForm: {},
      customerGroupFormRules: {
        name: [{ validator, trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    addCustomerGroup() {
      this.$refs.customerGroupForm.validate(
        validate => {
          if (validate) {
            customerAPI.addCustomerGroup({
              ...this.customerGroupForm
            }).then(({ data }) => {
              this.innerVisible = false
              this.customerGroupForm = {}
              this.$refs.customerGroupForm.resetFields()
              if (data.code === 200) {
                this.$emit('success')
                this.$message.success(`创建${this.customerStr}分组成功`)
              } else {
                this.$message.error(`创建${this.customerStr}分组失败`)
              }
            })
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

<template>
  <search-input
    v-model="searchWords"
    width="244px"
    placeholder="搜导航名称"
    @search="search"
  ></search-input>
</template>

<script>
import { SearchInput } from 'yiwise-components'

export default {
  components: {
    SearchInput
  },
  data() {
    return {
      searchWords: undefined
    }
  },
  methods: {
    search() {
      this.$emit('search', {
        searchWords: this.searchWords
      })
    },
    emptyFilter() {
      this.searchWords = undefined
    }
  }
}
</script>

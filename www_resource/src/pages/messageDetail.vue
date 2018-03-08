<template>
  <f7-page name="messageDetail" no-tabbar>
    <f7-navbar :back-link="true" title="查看消息"></f7-navbar>
    <div class="mod mod-about no-border-top">
      <h4 class="title">{{ item.Title }}</h4>
      <div class="sub-title">{{ item.Time }}</div>
      <div class="content-text">
        {{ item.Detail }}
      </div>
    </div>
  </f7-page>
</template>

<script>
import api from '../api'
export default {
  data () {
    return {
      item: ''
    }
  },
  methods: {
    fetch () {
      this.axios.get(
        api.app + '/messages/detail/' + this.$route.params.id,
      )
      .then(data => {
        this.item = data.data.Data
      })
    }
  },
  mounted () {
    this.fetch()
  }
}
</script>
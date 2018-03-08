<template>
  <f7-page no-tabbar>
    <f7-navbar :back-link="true" title="查看消息"></f7-navbar>
    <div class="mod mod-about no-border-top">
      <h4 class="title">{{ item.Title }}</h4>
      <div class="sub-title" v-if="item">{{ item.Time.replace(/T.*$/, '') + '   ' + item.Author }}</div>
      <div class="content-text" v-html>{{ item.Content }}</div>
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
        api.app + '/aboutus'
      )
      .then(data => {
        var tmp = data.data.Data
        this.item = tmp
      })
    },
  },
  mounted () {
    this.fetch()
  }
}
</script>
<template>
  <f7-page name="message" no-tabbar infinite-scroll @infinite="onInfiniteScroll" :infinite-scroll-preloader="false">
    <f7-navbar title="消息中心" :back-link="true"></f7-navbar>
    <no-data :value="isInit && !total " />
    <f7-list media-list v-if="items.length" class="information-list">
      <f7-list-item :link="'/message-detail/'+ item.Id" 
        :title="item.Title" v-for="item in items"
        :key="item.Time"
        :subtitle="item.Time.replace(/T|\.\d+/g, ' ')"></f7-list-item>
    </f7-list>
    <div class="infinite-scroll-preloader" v-if="total && total != items.length">
      <div class="preloader"></div>
    </div>
  </f7-page>
</template>

<script>
import api from '../api'
export default {
  data () {
    return {
      page: {
        pageindex: 1,
        pagesize: 15
      },
      total: 0,
      loadingStatus: false,
      items: [],
      isInit: false
    }
  },
  methods: {
    fetch () {
      this.axios.get(
        api.app + '/messages',
        {
          params: this.page
        }
      )
      .then(data => {
        var tmp = data.data.Data.Data
        if (!this.items.length) {
          this.$f7.hideIndicator()
        }
        if (data.data.Success) {
          this.isInit = true
        }
        this.$set(this, 'items', this.items.concat(tmp))
        this.total = data.data.Data.TotalCount
        if (!tmp.length) {
          this.$f7.detachInfiniteScroll(this.$$('.infinite-scroll'))
          this.$$('.infinite-scroll-preloader').remove()
        }
      })
    },
    onInfiniteScroll: _.throttle(function(){
      this.page.pageindex++
      this.fetch()
    }, 1000)
  },
  mounted () {
    if (!this.items.length) {
      this.$f7.showIndicator()
    }
    this.fetch()
  }
}
</script>
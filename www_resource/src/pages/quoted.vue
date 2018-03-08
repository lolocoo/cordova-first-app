<template>
  <f7-page
    id="listInfinite"
    name="list"
    no-swipeback
    pull-to-refresh
    infinite-scroll
    :infinite-scroll-preloader="false"
    @ptr:refresh="onRefresh"
    @infinite="onInfinite"
    >
    <f7-navbar back-link="Back" title="list" class="navbar-hidden">
      <f7-subnavbar>
        <f7-buttons>
          <f7-button route-tab-link="#unquoted" href="/quoted/">未报价</f7-button>
          <f7-button route-tab-link="#quoted" href="/quoted/quoted/">竞价中</f7-button>
          <f7-button route-tab-link="#bargain" href="/quoted/bargain/">议价中</f7-button>
        </f7-buttons>
      </f7-subnavbar>
    </f7-navbar>
    <f7-tabs>
      <f7-tab id="unquoted" />
      <f7-tab id="quoted" />
      <f7-tab id="bargain" />
    </f7-tabs>
  </f7-page>
</template>

<script>
var timeout
export default {
  data () {
    return {
      counter: 0
    }
  },
  methods: {
    onRefresh (event, done) {
      var vm = this
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        vm.$bus.$emit('update:list',  typeof(vm.$route.params.id) == 'undefined' ? 'unquoted' : vm.$route.params.id)
        vm.$bus.$on('updateSuccess:list', () => {
          done()
        })
      }, 1000)
    },
    onInfinite (event) {
      var vm = this
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        vm.$bus.$emit('load:list', this.$route.params.id)
      }, 1000)
    }
  }
}
</script>
<template>
  <f7-page 
    id="carriageInfinite"
    name="carriage"
    no-swipeback
    pull-to-refresh
    infinite-scroll
    :infinite-scroll-distance="100"
    :infinite-scroll-preloader="false"
    @ptr:refresh="onRefresh"
    @infinite="onInfinite">
    <f7-navbar back-link="Back" title="carriage" class="navbar-hidden">
      <f7-subnavbar>
        <f7-buttons>
          <f7-button route-tab-link="#pending" href="/carriage/">待确认</f7-button>
          <f7-button route-tab-link="#transport" href="/carriage/transport/">确认运输</f7-button>
          <f7-button route-tab-link="#dispatch" href="/carriage/dispatch/">已派单</f7-button>
          <f7-button route-tab-link="#extract" href="/carriage/extract/">已提车</f7-button>
          <f7-button route-tab-link="#shipping" href="/carriage/shipping/">已发运</f7-button>
          <f7-button route-tab-link="#delivery" href="/carriage/delivery/">已交车</f7-button>
        </f7-buttons>
      </f7-subnavbar>
    </f7-navbar>
    <f7-tabs>
      <f7-tab id="pending" />
      <f7-tab id="transport" />
      <f7-tab id="dispatch" />
      <f7-tab id="extract" />
      <f7-tab id="shipping" />
      <f7-tab id="delivery" />
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
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        this.$bus.$emit('update:carriage',  this.$route.params.id)
        this.$bus.$on('updateSuccess:carriage', () => {
          done()
        })
      }, 1000);
    },
    onInfinite (event) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        this.$bus.$emit('load:carriage',  this.$route.params.id)
      }, 1000);
    }
  },
  mounted () {
    // this.$bus.$emit('tab:carriage')
  }
}
</script>
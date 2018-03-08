<template>
  <f7-page no-swipeback :no-navbar="true" name="home" pull-to-refresh @ptr:refresh="onRefresh">
    <f7-swiper ref="banner" class="banner" :pagination="true" 
      :params="{ 
        observer: true, 
        lazy: true
      }">
      <f7-swiper-slide v-for="(item, index) in banner" :key="index">
          <img :src="item.FileUrl">
      </f7-swiper-slide>
    </f7-swiper>
    <div class="mod index-title">
      <div class="row row-custom order-form">
        <div class="col-50 text-black fz16">待办事项</div>
        <div class="col-50 text-right">已完成订单 <span class="text-danger">{{pending['Finish']}}</span></div>
      </div>
    </div>
    <div class="index-list">
      <div class="mod row text-center no-border-bottom">
        <div class="col-33" @click="navToPage('/quoted/')">
          <em class="fz26">{{pending['WaitQuote']}}</em>
          <span>待报价</span>
        </div>
        <div class="col-33"  @click="navToPage('/carriage/')">
          <em class="fz26">{{pending['WaitConfirm']}}</em>
          <span>待确认</span>
        </div>
        <div class="col-33"  @click="navToPage('/carriage/transport/')">
          <em class="fz26">{{pending['WaitOrder']}}</em>
          <span>待派送</span></div>
      </div>
      <div class="mod row text-center no-border-top">
        <div class="col-33"  @click="navToPage('/carriage/dispatch/')">
          <em class="fz26">{{pending['WaitTakeCar']}}</em>
          <span>待提车</span></div>
        <div class="col-33"  @click="navToPage('/carriage/extract/')">
          <em class="fz26">{{pending['WaitSendCar']}}</em>
          <span>待发车</span></div>
        <div class="col-33"  @click="navToPage('/carriage/shipping/')">
          <em class="fz26">{{pending['WaitArrival']}}</em>
          <span>待运达</span></div>
      </div>
    </div>
  </f7-page>
</template>

<script>
var timeout
export default {
  data() {
    return {
      pending: {
        Finish: 0,
        WaitArrival: 0,
        WaitConfirm: 0,
        WaitOrder: 0,
        WaitQuote: 0,
        WaitSendCar: 0,
        WaitTakeCar: 0
      },
      banner: [],
      isSwiperInit: true
    };
  },
  methods: {
    fetchPendingTask () {
      this.axios.get("/Logistics/LogisticStats").then(res => {
        this.pending = res.data.Data;
      });
    },
    fetchBanner () {
      this.axios.get(this.api.app + "/banners").then(res => {
        this.banner = res.data.Data;
      });
    },
    navToPage (page) {
      if (page == "/quoted/") {
        window.f7.views.quoted.router.loadPage(page);
        window.f7.showTab("#quoted")
        return false;
      }
      window.f7.views.order.router.loadPage(page);
      window.f7.showTab("#order");
    },
    onRefresh (event, done) {
      var vm = this
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        vm.fetchBanner()
        vm.fetchPendingTask()
        done()
      }, 1000)
    }
  },
  mounted() {
    var vm = this;
    if (this.ls.getItem("isLogin") == "true") {
      vm.fetchBanner()
      vm.fetchPendingTask()
    }
    vm.$bus.$on("login", function() {
      vm.fetchBanner()
      vm.fetchPendingTask()
    });
    vm.$$("html").removeClass("with-statusbar-overlay")
  }
};
</script>
<template>
  <div>
    <no-data :value="isInit && !listTotal " />
    <div class="mod mt10" v-for="(item, index) in listData" :key="index">
      <div class="row row-custom order-form">
        <div class="col-50 text-black"> <span class="order-num">{{ item.OrderId }}</span></div>
        <div class="col-50 text-right fz12 fw200 mt4">下单时间：{{ item.CreateTime.split('T')[0] }}</div>
      </div>
      <div class="double-box site mb15" v-if="listParams.QuoteStage != 2">
        <i class="icon-transport"></i>
        <div class="row row-custom">
          <div class="col-45">
            <span>
              {{ item.SendCity }}<br />{{ item.SendRegion }}
            </span>
          </div>
          <div class="col-45">
            <span>
              {{ item.ReceiveCity }}<br />{{ item.ReceiveRegion }}
            </span>
          </div>
        </div>
      </div>
      <template v-if="listParams.QuoteStage == 2">
        <div class="double-box price">
          <div class="row row-custom">
            <div class="col-50"><span class="report-price">{{ item.Quotes }}</span><span>我的报价（元）</span></div>
            <div class="col-50"><span class="confer-price">{{ item.BargainQuotes }}</span><span>用户议价（元）</span></div>
          </div>
        </div>
        <div class="double-box site site-min"><i class="icon-transport"></i>
          <div class="row row-custom">
            <div class="col-45">
              <span>
                {{ item.SendCity }}<br />{{ item.SendRegion }}
              </span>
            </div>
            <div class="col-45">
              <span>
                {{ item.ReceiveCity }}<br />{{ item.ReceiveRegion }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <table class="table">
        <thead>
          <tr>
            <th>车型</th>
            <th class="text-right">数量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(car, carIdx) in item.Cars.slice(0, 2)" :key="carIdx">
            <td>{{ car.DisplayName }}</td>
            <td class="text-right">{{ car.CarCount }} 台</td>
          </tr>
          <template v-if="item.show">
            <tr v-for="(car, carIdx) in item.Cars.slice(2)" :key="carIdx">
              <td>{{ car.DisplayName }}</td>
              <td class="text-right">{{ car.CarCount }} 台</td>
            </tr>
          </template>
        </tbody>
      </table>
      <a class="show-all" v-if="item.Cars.length > 2  " @click.prevent="showAllCars(item)" href="javascript:void(0)">显示全部</a>
        <template v-if="listParams.QuoteStage == 1">
          <div class="text-center mt15">
            <f7-link class="button min-button-big" :href="'/send-quoted/' + item.OrderId">我要报价</f7-link>
          </div>
        </template>
        <template v-if="listParams.QuoteStage == 2">
          <div class="text-center mt15">
            <f7-link class="button button-big min-button-big button-light margin-center mr10" :href="'/update-quoted/' + item.OrderId">更新报价</f7-link>
            <a class="button button-big min-button-big margin-center" @click.prevent="accept(item)" href="#">接受议价</a>
          </div>
        </template>
        <template v-if="listParams.QuoteStage == 3">
          <div class="row row-price">
            <div class="col-100 text-right">
              <div class="my-price">我的报价：<span class="num">{{ item.Quotes ? item.Quotes : item.NewQuotes }}</span>元</div>
            </div>
          </div>
        </template>
    </div>
    <div class="infinite-scroll-preloader" v-if="listTotal && listTotal > listData.length">
      <div class="preloader"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      listTotal: 0,
      listType: '',
      listData: [],
      listParams: {
        QuoteStage: 1,
        Offset: 0,
        Limit: 10,
        Timestamp: new Date().valueOf()
      },
      isInit: false,
      inSequence: false
    }
  },
  methods: {
    fetch () {
      var vm = this
      if (!this.listData.length) {
        this.$f7.showIndicator()
      }
      this.axios
        .get("/quotes/loadmore", {
          params: vm.listParams
        })
        .then(res => {
          if (res.data.Success && !this.isInit ) {
            this.isInit = true
          }

          if (res.data.Data.List.length) {
            this.listParams.Offset += this.listParams.Limit
          }

          if (!this.listData.length) {
            this.$f7.hideIndicator()
          }

          this.listTotal = res.data.Data.Total
          this.listData = this.listData.concat(res.data.Data.List)
          
          // if (!res.data.Data.List.length) {
          //   _.delay(this.$f7.toast('无更多数据').show, 500)
          // }
        })
    },
    fetchUpdate () {
      this.axios
        .get("/quotes/loadnew", {
          params: {
            QuoteStage: this.listParams.QuoteStage,
            Timestamp: this.listParams.Timestamp
          }
        })
        .then(res => {
          var vm = this
          this.$bus.$emit('updateSuccess:list')
          if (!res.data.Data.List.length) {
            // vm.$f7.toast('当前列表已为最新').show()
            return false
          }
          this.listParams.Timestamp = new Date().valueOf()
          this.listData.unshift(...res.data.Data.List)
        })
    },
    accept (item) {
      let form = {
        OrderId: item.OrderId,
        OfferNo: item.OfferNo,
        isAccept: true
      }

      var idx = _.findIndex(this.bargain, ['OrderId', item.OrderId])

      this.axios
        .post("/quotes/Bargain", form)
        .then(res => {
          if (!res.data.Success) {
            this.$f7.toast(res.data.ErrorMessage).show()
            return false
          }
          this.$f7.toast('接受议价成功').show()
          this.listData.splice(idx, 1)
          this.fetch()
        })
    },
    showAllCars (item) {
      this.$set(item, 'show', true)
      this.$$(event.target).hide()
    },
    // event bus
    loadList (tabId) {
      var vm = this
      if (vm.listData.length < vm.listTotal) {
        vm.fetch()
      }
    },
    updateList (tabId) {
      this.fetchUpdate()
    }
  },
  created () {
    this.$bus.$on('load:list', this.loadList)
    this.$bus.$on('update:list', this.updateList)
  },
  beforeDestroy () {
    this.$bus.$off('load:list', this.loadList)
    this.$bus.$off('update:list', this.updateList)
  },
  mounted() {
    var vm = this
    var id = typeof(this.$route.params.id) == 'undefined' ? 'unquoted' : this.$route.params.id
    if (id == 'bargain') {
      this.listParams.QuoteStage = 2
    } else if (id == 'quoted') {
      this.listParams.QuoteStage = 3
    }
    this.fetch()
  }
};
</script>
<style>
</style>
<template>
  <div>
    <no-data :value="isInit && !carriageTotal " />
    <template v-for="(item, index) in carriageData">
      <order-item :order-data="item" :key="item.Id" :order-status="mapType[carriageType].value" :btn-name="mapType[carriageType].btn"></order-item>
    </template>
    <div class="infinite-scroll-preloader" v-if="carriageTotal && carriageTotal > carriageData.length">
      <div class="preloader"></div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      carriageType: 'pending',
      mapType: {
        pending: {
          value: -1,
          btn: '确认运输'
        },
        transport: {
          value: 1,
          btn: '确认派单'
        },
        dispatch: {
          value: 2,
          btn: '确认提车'
        },
        extract: {
          value: 3,
          btn: '确认发运'
        },
        shipping: {
          value: 4,
          btn: '确认运达'
        },
        delivery: {
          value: 5,
          btn: ''
        }
      },
      carriageParams: {
        LogisticsOrderNo: '',
        CreateTime: '',
        LogisticsOrderState: -1,
        SettleBillState: '',
        CarrierId: '',
        Offset: 0,
        Limit: 10,
        Date: this.moment().format('YYYY-MM-DD HH:mm:ss'),
        LoadType: 1
      },
      carriageTotal: 0,
      carriageData: [],
      isInit: false,
      loadingText: '加载中...'
    }
  },
  methods: {
    fetch () {
      if (!this.carriageData.length) {
        this.$f7.showIndicator()
      }
      this.axios
        .post("/Logistics/Index", this.carriageParams)
        .then(res => {
          if (res.data.Success && !this.isInit ) {
            this.isInit = true
          }
          if (res.data.Data.Data.length) {
            this.carriageParams.Offset += this.carriageParams.Limit
          }
          
          if (!this.carriageData.length) {
            this.$f7.hideIndicator()
          }
          
          this.carriageTotal = res.data.Data.Total
          this.carriageData = this.carriageData.concat(res.data.Data.Data)
          
          // if (!res.data.Data.Data.length) {
          //   _.delay(this.$f7.toast('无更多数据').show, 500)
          // }
        })
    },
    fetchUpdate () {
      this.axios
        .post("/Logistics/Index",
          _.assign({}, this.carriageParams, { LoadType: 2 })
        )
        .then(res => {
          this.$bus.$emit('updateSuccess:carriage')
          if (!res.data.Data.Data.length) {
            return false
          }
          this.carriageParams.Date = this.moment().format('YYYY-MM-DD HH:mm:ss')
          this.carriageData.unshift(...res.data.Data.List)
        })
    },
    loadCarriage () {
      var vm = this
      if (vm.carriageData.length < vm.carriageTotal ) {
        vm.fetch()
      }
    },
    updateCarriage () {
      this.fetchUpdate()
    },
    updateLogistic (id, orderstate) {
      let idx = _.findIndex(this.carriageData, { LogisticsNo: id })
      if (this.carriageData[idx].WayBillStatus == 4 && orderstate == 3) return false
      this.carriageData.splice(idx, 1)
      if (this.carriageData.length < 2) {
        this.fetch()
      }
    }
  },
  components: {
    'orderItem': {
      props: ['orderData', 'btnName', 'orderStatus', 'btnUpdate'],
      template: `
        <div class="mod mt10" @click="viewDetail(orderData)">
          <div class="row row-custom order-form">
            <div class="col-50 text-black"> <span class="order-num">{{orderData.LogisticsNo}}</span></div>
            <div class="col-50 text-right fz12 fw200 mt4">下单时间：{{orderData.CreateTime.split('T')[0]}}</div>
          </div>
          <div class="double-box site"><i class="icon-transport"></i>
            <div class="row row-custom">
              <div class="col-50"><span>{{orderData.SendCityName}}</span><span>{{orderData.SendRegion}}</span></div>
              <div class="col-50"><span>{{orderData.ReceiveCityName}}</span><span>{{orderData.ReceiveRegion}}</span></div>
            </div>
          </div>
          <p class="text-black text-cut">
            <label class="text-label text-initial">始发地：</label>{{orderData.SendAddress}}
          </p>
          <p class="text-black text-cut"> 
            <label class="text-label text-arrive">到达地：</label>{{orderData.ReceiveAddress}}
          </p>
          <table class="table">
            <thead>
              <tr>
                <th>车型</th>
                <th class="text-right">数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="car in orderData.Cars.slice(0, orderData.show ? orderData.length : 2)">
                <td class="">{{car.BrandName}} {{car.SerialName}}</td>
                <td class="text-right">{{car.Num}}台</td>
              </tr>
            </tbody>
          </table>
          <a class="show-all" v-if="orderData.Cars.length > 2"  @click.prevent.stop="showAllCars(orderData)" href="#">显示全部</a>
          <div class="row row-price no-padding-top-bottom mt10">
            <div class="col-100 text-right"> 
              <div class="my-price">订单金额：<span class="num">{{orderData.Amount}}</span>元</div>
            </div>
            <div class="col-100 text-center">
              <f7-link
                v-if="orderStatus == 4"
                @click.prevent.navtive="updateLogistics(orderData, true)"
                class="button button-big button-light min-button-big" 
                href="#">更新物流状态</f7-link>
              <f7-link
                v-if="btnName"
                @click.prevent.navtive="updateLogistics(orderData)"
                class="button button-big min-button-big" 
                href="#">{{btnName}}</f7-link>
            </div>
          </div>
        </div>
      `,
      methods : {
        showAllCars (item) {
          this.$set(item, 'show', true)
          this.$$(event.target).hide()
        },
        updateLogistics (item, minus) {
          this.$router.load({
            url: '/update-logistics/' 
              + item.LogisticsNo 
              + '/' 
              + (minus ? this.orderStatus - 1 : this.orderStatus) 
              + (item.WaybillId ? '?waybillNo=' + item.WaybillId :'')
          })
        },
        viewDetail (item) {
          this.$router.load({
            url: '/order-detail/' + item.Id
          })
        }
      }
    }
  },
  created () {
    this.$bus.$on('load:carriage', this.loadCarriage)
    this.$bus.$on('update:carriage', this.fetchUpdate)
    this.$bus.$on('updateLogistic', this.updateLogistic)
  },
  beforeDestroy () {
    this.$bus.$off('load:carriage', this.loadCarriage)
    this.$bus.$off('update:carriage', this.fetchUpdate)
    this.$bus.$off('updateLogistic', this.updateLogistic)
  },
  mounted () {
    var vm = this
    if (!_.isUndefined(this.$route.params.id)) {
      this.carriageType = this.$route.params.id
      this.carriageParams.LogisticsOrderState = this.mapType[this.$route.params.id].value
    }    
    this.fetch()
  }
}
</script>

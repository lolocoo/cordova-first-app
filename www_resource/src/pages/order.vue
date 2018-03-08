<template>
  <f7-page
    :no-navbar="false"
    no-page-content
    no-swipeback
    name="order"
    :cached="true"
    @page:reinit="pageInit"
    >
    <f7-navbar>
      <f7-buttons>
        <f7-button @click="switchStage(-1)" tab-link=".pending" active>待确认</f7-button>
        <f7-button @click="switchStage(1)" tab-link=".transport">确认运输</f7-button>
        <f7-button @click="switchStage(2)" tab-link=".dispatch">已派单</f7-button>
        <f7-button @click="switchStage(3)" tab-link=".extract">已提车</f7-button>
        <f7-button @click="switchStage(4)" tab-link=".shipping">已发运</f7-button>
        <f7-button @click="switchStage(5)" tab-link=".delivery">已交车</f7-button>
      </f7-buttons>
    </f7-navbar>
    <f7-tabs animated>
      <!-- pendding -->
      <f7-page-content 
        tab
        active
        class="pending pull-to-refresh-content infinite-scroll"
        data-distance="100">
         <page-action>
          <template v-for="(item, index) in pending">
            <order-item :order-data="item" :key="item.Id" :order-status="orderType[current].value" btn-name="确认运输"></order-item>
          </template>
        </page-action>
      </f7-page-content>
      <!-- transport -->
      <f7-page-content 
        tab
        class="transport pull-to-refresh-content infinite-scroll"
        data-distance="100">
        <page-action>
          <template v-for="(item, index) in transport">
            <order-item :order-data="item" :key="item.Id" :order-status="orderType[current].value" btn-name="确认派单"></order-item>
          </template>
        </page-action>
      </f7-page-content>
      <!-- dispatch -->
      <f7-page-content 
        tab
        class="dispatch pull-to-refresh-content infinite-scroll"
        data-distance="100">
        <page-action>
          <template v-for="(item, index) in dispatch">
            <order-item :order-data="item" :key="item.Id" :order-status="orderType[current].value" btn-name="确认提车"></order-item>
          </template>
        </page-action>
      </f7-page-content>
      <!-- extract -->
      <f7-page-content 
        tab
        class="extract pull-to-refresh-content infinite-scroll"
        data-distance="100">
        <page-action>
          <template v-for="(item, index) in extract">
            <order-item :order-data="item" :key="item.Id" :order-status="orderType[current].value" btn-name="确认发运"></order-item>
          </template>
        </page-action>
      </f7-page-content>
      <!-- shipping -->
      <f7-page-content 
        tab
        class="shipping pull-to-refresh-content infinite-scroll"
        data-distance="100">
        <page-action>
          <template v-for="(item, index) in shipping">
            <order-item :order-data="item" 
                        :key="item.Id" 
                        :order-status="orderType[current].value"
                        :btn-update="true"
                        btn-name="确认运达">
            </order-item>
          </template>
        </page-action>
      </f7-page-content>
      <!-- delivery -->
      <f7-page-content 
        tab
        class="delivery pull-to-refresh-content infinite-scroll"
        data-distance="100">
        <page-action>
          <template v-for="(item, index) in delivery">
            <order-item :order-data="item" :key="item.Id" :order-status="orderType[current].value"></order-item>
          </template>
        </page-action>
      </f7-page-content>
    </f7-tabs>
  </f7-page>
</template>

<script>
export default {
  data() {
    return {
      current: 'pending',
      reqParams: {
        LogisticsOrderNo: '',
        CreateTime: '',
        LogisticsOrderState: '',
        SettleBillState: '',
        CarrierId: '',
        Offset: 0,
        Limit: 10,
        Date: this.moment().format('YYYY-MM-DD HH:mm:ss'),
        LoadType: 1
      },
      orderType: {
        pending: {
          value: -1
        },
        transport: {
          value: 1
        },
        dispatch: {
          value: 2
        },
        extract: {
          value: 3
        },
        shipping: {
          value: 4
        },
        delivery: {
          value: 5
        }
      },
      pending: [],
      transport: [],
      dispatch: [],
      extract: [],
      shipping: [],
      delivery: [],
      pendingTotal: 0,
      transportTotal: 0,
      dispatchTotal: 0,
      extractTotal: 0,
      shippingTotal: 0,
      deliveryTotal: 0,
      pendingParams: {},
      transportParams: {},
      dispatchParams: {},
      extractParams: {},
      shippingParams: {},
      deliveryParams: {}
    }
  },
  methods: {
    fetch () {
      if (!this[this.current].length) {
        this.$f7.showIndicator()
      }
      this.axios
        .post("/Logistics/Index", {
          ...this[this.current+'Params']
        })
        .then(res => {
          if (res.data.Data.Data.length) {
            this[this.current+'Params'].Offset += this[this.current+'Params'].Limit
          }
          
          if (!this[this.current].length) {
            this.$f7.hideIndicator()
          }
          this[this.current + 'Total'] = res.data.Data.Total
          this[this.current] = this[this.current].concat(res.data.Data.Data)
          
          if (!res.data.Data.Data.length) {
            setTimeout(this.$f7.toast('无更多数据').show, 500)
          }
        })
    },
    fetchUpdate () {
      this.axios
        .post("/Logistics/Index",
          _.assign({}, this[this.current+'Params'], { LoadType: 2 })
        )
        .then(res => {
          this.$f7.pullToRefreshDone()
          if (!res.data.Data.Data.length) {
            return false
          }
          this[this.current].Date = this.moment().format('YYYY-MM-DD HH:mm:ss')
          this[this.current].unshift(...res.data.Data.List)
        })
    },
    fetchOrderType () {
      this.axios
        .get("/Logistics/GetWaybillState")
        .then(res => {
          // console.log(res.data.Data)
        })
    },
    initData () {
      var types = _.keys(this.orderType)
      _.each(types, item => {
        this[item+'Params'] = _.assign({}, 
          this.reqParams, 
          {
             LogisticsOrderState: this.orderType[item].value
          })
      })
    },
    switchStage (stage) {
      var stageType = _.keys(this.orderType)[ stage < 0 ? 0 : stage]
      this.current = stageType
      if (!this[stageType].length) {
        this.fetch()
        return false
      }
      this.fetchUpdate()
    },
    showTab (index, tab) {
      this.switchStage(index)
      this.$f7.showTab(tab)
    },
    pageInit (e) {
      console.log('page reinit')
    },
    viewDetail (item) {
      this.$router.load({
        url: '/order-detail/' + item.Id
      })
    },
    updateLogistics (item) {
      this.$router.load({
        url: '/update-logistics/' + item.Id
      })
    },
    showAllCars (item) {
      this.$set(item, 'show', true)
      this.$$(event.target).hide()
    }
  },
  mounted () {
    let vm = this
    let content = this.$$(_.chain(this.orderType).keys().map(item => '.' + item).value().join(','))
    this.initData()
    this.fetchOrderType()
    this.fetch()

    content.on("ptr:refresh", () => vm.fetchUpdate())
    content.on('infinite', this._.debounce(this.fetch, 500))
    
    this.$bus.$on('updateLogistic', (id, orderstate) => {
      let items = this[this.current]
      let idx = _.findIndex(items, { LogisticsNo: this.$route.params.id })
      
      if (items[idx].WayBillStatus == 4 && orderstate == 3) return false
      
      items.splice(_.findIndex(items, { LogisticsNo: this.$route.params.id }), 1)
      
      if (items.length < 2) {
        this.fetch()
      }
    })

    this.$bus.$emit('tab:order')

    // if (this.$bus.tasks.pop() == 'WaitTakeCar') {
    //   this.switchStage(2)
    //   this.$f7.showTab('.dispatch')
    // }

    this.$nextTick(function(){
      switch (this.$bus.tasks.pop()) {
        case 'WaitConfirm':
          vm.showTab(-1, '.pedding')
          break
        case 'WaitOrder':
          vm.showTab(1, '.transport')
          break
        case 'WaitTakeCar':
          vm.showTab(2, '.dispatch')
          break
        case 'WaitSendCar':
          vm.showTab(3, '.extract')
          break
        case 'WaitArrival':
          vm.showTab(4, '.shipping')
          break 
        default:
          break
      }
    })

  },
  components: {
    'page-action': {
      name: 'page-action',
      props: ['total', 'itemLen'],
      template: `
        <div>
          <div class="pull-to-refresh-layer">
            <div class="preloader"></div>
            <div class="pull-to-refresh-arrow"></div>
          </div>
          <slot></slot>
          <div class="infinite-scroll-preloader">
            <div class="preloader"></div>
          </div>
        </div>
      `
    },
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
                v-if="btnUpdate"
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
  }
}
</script>
<style>
.btn-update {
  margin-top: 10px;
}
</style>
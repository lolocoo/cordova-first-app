<template>
  <f7-page :no-tabbar="true">
    <f7-navbar title="更新报价" :back-link="true" sliding></f7-navbar>
    <template v-if="item">
      <div class="mod pb10">
        <div class="row row-custom order-form">
          <div class="col-50 text-black"> <span class="order-num">{{ $route.params.id }}</span></div>
          <div class="col-50 text-right fz12 fw200 mt4">下单时间：{{item.OrderTime}}</div>
        </div>
        <div class="double-box price">
          <div class="row row-custom">
            <div class="col-50">
              <span class="report-price">{{item.Quote}}</span>
              <span>我的报价（元）</span>
            </div>
            <div class="col-50">
              <span class="confer-price">{{item.BargainQuote}}</span>
              <span>用户议价（元）</span>
            </div>
          </div>
        </div>
        <div class="double-box site site-min">
          <i class="icon-transport"></i>
          <div class="row row-custom">
            <div class="col-45"><span>{{item.StartCity}}</span><span>{{item.StartRegion}}</span></div>
            <div class="col-45"><span>{{item.EndCity}}</span><span>{{item.EndRegion}}</span></div>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>车型</th>
              <th class="text-right">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(car, idx) in item.InquireCars">
              <td>{{car.DisplayName}}</td>
              <td class="text-right">{{car.CarCount}}台</td>
            </tr>
          </tbody>
        </table>
        <!-- <a class="show-all" href="javascript:void(0)">显示全部</a> -->
      </div>

      <h4 class="sub-title">报价信息</h4>
      <div class="mod no-padding-top-bottom">
        <div class="list-block list-block-input no-margin">
          <ul>
            <li v-for="(car, idx) in item.InquireCars" :key="idx">
              <div class="item-content">
                <div class="item-inner">
                  <div class="item-title">{{car.DisplayName}} {{car.CarCount}}台 </div>
                  <div class="item-input item-input-right">
                    <input class="form-control input-form-control" type="number" pattern="\d*" v-model="car.Price" placeholder="请输入价格">
                    <span class="text-right">元／台</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="row row-price">
          <div class="col-100 text-right">
            <div class="my-price">
              运费总额：
              <span class="num" v-if="item">{{priceTotal}}</span>
              元
            </div>
          </div>
        </div>
      </div>
      <div class="mod no-padding-top-bottom mt10">
        <div class="list-block list-block-input no-margin">
          <ul class="no-border-bottom">
            <li>
              <div class="item-content">
                <div class="item-inner">
                  <div class="item-title">有效报价截止时间 </div>
                  <div class="item-after item-input-right">
                    <span style="position: absolute; z-index: 0; top: 11px;" v-show="form.EffectiveDate.length == 0">请选择日期</span>
                    <f7-datepicker
                      class="date-picker"
                      :value="currentTime"
                      :monthNames="'一 二 三 四 五 六 七 八 九 十 十一 十二 '.replace(/\s/g, '月 ').split(' ')"
                      :dayNamesShort="'日 一 二 三 四 五 六'.split(' ')"
                      @change="datepickerChanged" 
                      :closeOnSelect="true"></f7-datepicker>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="item-content">
                <div class="item-inner">
                  <div class="item-title">预估运输时间<i class="fz12">（含配载）</i></div>
                  <div class="item-after item-input-right">
                    <input class="form-control input-form-control r20" 
                      type="number" 
                      pattern="\d*"
                      v-model="form.TransDuration" 
                      placeholder="请输入">
                    <span class="text-right">天</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="text-center mt15 mb60">
        <a class="button button-big button-big-all" href="#" @click="applyForm">提交报价</a>
      </div>
    </template>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      item: '',
      currentTime: '',
      form : {
        OrderId: this.$route.params.id,
        OfferNo: '',
        isAccept: false,
        Quote: '',
        EffectiveDate: '',
        TransDuration: '',
        UnitPrice: ''
      }
    }
  },
  computed: {
    priceTotal: function () {
      var cars = this.item.InquireCars
      return cars.length == 1 ?
                 cars[0].Price * cars[0].CarCount :
                 cars.reduce((acc, cur) => acc.Price * acc.CarCount + cur.Price * cur.CarCount)
    }
  },
  methods: {
    fetch () {
      this.axios
        .get("/quotes/GetQuoteInfo", {
          params: {
            orderid: this.$route.params.id
          }
        })
        .then(res => {
          this.item = res.data.Data
          this.$f7.hideIndicator()
        })
    },
    datepickerChanged (c, values, displayValues) {
      var date = new Date(values)
      this.form.EffectiveDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    },
    applyForm () {
      this.form.Quote = this.priceTotal
      this.form.OfferNo = this.item.OfferNo
      this.form.UnitPrice = this.item.InquireCars.map(item => {
        return {
          CarId: item.CarId,
          Quantity: item.CarCount,
          Price: item.Price
        }
      })
      var valid = _.chain(this.form)
          .omit(['isAccept'])
          .values()
          .map(item => {
            if (_.isArray(item)) {
              return item.map(c => c.Price)
            }
            return item
          })
          .flatten()
          .value()
      if (valid.length != _.compact(valid).length) {
        this.$f7.toast('请完善信息').show()
        return false
      }
      this.axios
        .post("/quotes/bargain", this.form)
        .then(res => {
          if (!res.data.Success) {
            this.$f7.toast(res.data.ErrorMessage).show()
            return false
          }
          this.$router.back()
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted () {
    this.$f7.showIndicator()
    this.fetch()
  }
}
</script>
<style>
.date-picker {
  z-index: 2;
}
.date-picker input {
  font-size: 14px!important;
}
</style>
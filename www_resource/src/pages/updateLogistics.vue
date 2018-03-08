<template>
  <f7-page name="updateLogistics" :no-tabbar="true">
    <f7-navbar :back-link="true" title="订单详情"></f7-navbar>
    <div class="mod list-block-custom mb10 no-padding-bottom">
      <div class="list-block">
        <ul>
          <li>
            <div class="item-content">
              <div class="item-media"></div>
              <div class="item-inner">
                <div class="item-title label">承运状态</div>
                <div class="item-input text-black" v-if="nextState">{{nextState.Text}}</div>
              </div>
            </div>
          </li>
          <template v-if="this.$route.params.state == -1">
            <li>
              <div class="item-content">
                <div class="item-media"></div>
                <div class="item-inner">
                  <div class="item-title label">运单号</div>
                  <div class="item-input">
                    <input class="form-control input-form-control" v-model="form.WaybillNo" type="text" placeholder="请输入运单号">
                  </div>
                </div>
              </div>
            </li>
          </template>
          <template v-if="this.$route.params.state == 1 || this.$route.params.state == 3">
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">司机</div>
                  <div class="item-input">
                    <input class="form-control input-form-control" v-model="form.DriverName" type="text" placeholder="请输入司机姓名">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">司机电话</div>
                  <div class="item-input">
                    <input class="form-control input-form-control" v-model="form.DriverMobile" type="number" placeholder="请输入电话号码">
                  </div>
                </div>
              </div>
            </li>
          </template>
          <template v-if="this.$route.params.state == 3">
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">时间</div>
                  <div class="item-input">
                    <f7-datepicker
                      class="date-picker"
                      :value="new Date().getTime()"
                      :monthNames="'一 二 三 四 五 六 七 八 九 十 十一 十二 '.replace(/\s/g, '月 ').split(' ')"
                      :dayNamesShort="'日 一 二 三 四 五 六'.split(' ')"
                      :closeOnSelect="true"></f7-datepicker>
                  </div>
                </div>
              </div>
            </li>
            <li class="align-top">
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">地点</div>
                  <div class="item-input">
                    <textarea class="">{{EffectiveDate}}</textarea>
                  </div>
                </div>
              </div>
            </li>
          </template>
          <template v-if="this.$route.params.state == 4">
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">收车人</div>
                  <div class="item-input">
                    <input class="form-control input-form-control" type="text" placeholder="请输入收车人姓名">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">收车人电话</div>
                  <div class="item-input">
                    <input class="form-control input-form-control" type="text" placeholder="请输入收车人电话">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="item-content">
                <div class="item-media"><i class="icon icon-form-name"></i></div>
                <div class="item-inner">
                  <div class="item-title label">时间</div>
                  <div class="item-input">
                    <f7-datepicker
                      class="date-picker"
                      :value="new Date().getTime()"
                      :monthNames="'一 二 三 四 五 六 七 八 九 十 十一 十二 '.replace(/\s/g, '月 ').split(' ')"
                      :dayNamesShort="'日 一 二 三 四 五 六'.split(' ')"
                      :closeOnSelect="true"></f7-datepicker>
                  </div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
    <div class="text-center mt15 mb60">
      <a class="button button-big button-big-all" @click.prevent="save" href="#">提交</a>
      </div>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      item: '',
      state: '',
      EffectiveDate: '',
      form: {
        WaybillState: '',
        WaybillNo: '',
        DriverName: '',
        DriverMobile: '',
        ReceiveName: '',
        ReceiveMobile: '',
        TransTime: this.moment().format('YYYY-MM-DD H:mm:ss'),
        LogisticsNo: this.$route.params.id,
        CarrierId: '',
        Descriptio: ''
      }
    }
  },
  computed: {
    nextState: function () {
      let state = this.$route.params.state == -1 ? 1 : parseInt(this.$route.params.state, 10) + 1
      return _.chain(this.state).filter(item => item.Value == state).head().value()
    }
  },
  methods: {
    fetch () {
      this.axios
        .post("/Logistics/SelectByLogisticId", {
          Id: this.$route.params.id
        })
        .then(res => {
          this.item = res.data.Data
        })
    },
    fetchState () {
      this.axios
        .get("/Logistics/GetWaybillState")
        .then(res => {
          this.state = res.data.Data
        })
    },
    save () {
      let form = {
        WaybillState: this.nextState.Value
      }
      if ( this.$route.query.waybillNo ) {
        form.WaybillNo = this.$route.query.waybillNo
      }
      let url = '/Logistics/UpdateWaybill'

      switch (this.nextState.Value) {
        case 1:
          url = '/Logistics/SaveWaybill'
          form = _.assign(this.form, form)
          break
        case 2:
          form = _.assign(this.form, form)
          break
        default:
          form = _.assign(this.form, form)
      }
      this.$f7.showPreloader('提交中...')
      this.axios
        .post(url, form)
        .then(res => {
          this.$f7.hidePreloader()
          if (res.data.ErrorMessage) {
            this.$f7.alert(res.data.ErrorMessage, '提示')
            return false
          }
          this.$bus.$emit('updateLogistic', this.$route.params.id, this.$route.params.state)
          // this.$bus.$emit('updateLogistic', form.WaybillNo, this.$route.params.state)
          this.$router.back()
        })
    }
  },
  beforeMount () {
    this.fetch()
    this.fetchState()
    console.log(this.moment().format('YYYY-MM-DD'))
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

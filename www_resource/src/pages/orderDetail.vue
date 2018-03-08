<template>
  <f7-page class="page-content-gap" :no-tabbar="true">
    <f7-navbar :back-link="true" title="订单详情"></f7-navbar>
    <template v-if="item">
      <div class="mod">
        <div class="indent-info text-center">
          <div class="order-num text-black fz24">{{item.OrderId}}</div>
          <div class="label">
            <label>{{item.LogisticsStatusText}}</label>
          </div>
          <div class="fz12 text-shallow-gray">下单时间：{{ (item.CreateTime || '').replace(/T|\.\d*/g, ' ') }}</div>
        </div>
        <div class="detail-info-list">
          <ul>
            <li>
              <div class="item-info">
                <label>发车地：</label>
                <div class="pull-right">
                  {{item.Detail.SenderAddress || '--'}}
                </div>
              </div>
              <div class="item-info">
                <label>收车地：</label>
                <div class="pull-right">
                  {{item.Detail.ReceiverAddress}}
                </div>
              </div>
            </li>
            <li class="no-border">
              <div class="item-info">
                <label>发车人：</label>
                <div class="pull-right">{{item.Detail.SenderDealerName}}  |  电话：{{item.Detail.SenderMobile}}</div>
              </div>
              <div class="item-info">
                <label>身份证：</label>
                <div class="pull-right">{{item.Detail.SenderIdNumber}}</div>
              </div>
            </li>
            <li>
              <div class="item-info">
                <label>收车人：</label>
                <div class="pull-right">{{item.Detail.ReceiverName}}  |  电话：{{item.Detail.ReceiverMobile}}</div>
              </div>
              <div class="item-info">
                <label>身份证：</label>
                <div class="pull-right">{{item.Detail.ReceiverIdNumber}}</div>
              </div>
            </li>
            <li>
              <div class="item-info">
                <label>订单金额：</label>
                <div class="pull-right">{{item.Amount}}元</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <h4 class="sub-title">车辆信息</h4>
      <div class="mod no-padding-bottom">
        <template v-for="car in item.Cars">
          <div class="row no-gutter text-black">
            <div class="col-50">{{car.BrandName + ' ' + car.SerialName}}</div>
            <div class="col-50 text-right">共 {{car.Num}} 台</div>
          </div>
          <table class="table text-black mt10 mb10">
            <thead>
              <tr>
                <th>VIN码</th>
                <th class="text-right">外观／内饰</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="desc in car.DisplayCars">
                <td>{{desc.Vin}}</td>
                <td class="text-right">{{desc.Color}}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
      <h4 class="sub-title">物流信息</h4>
      <div class="mod" v-if="item">
        <div class="detail-info-list" style="margin-top: 0">
          <ul>
            <li>
              <div class="item-info no-border">
                <label>运单号：</label>
                <div class="pull-right">
                  {{item.LogisticsNo}}
                </div>
              </div>
              <div class="item-info">
                <label>运单状态：</label>
                <div class="pull-right">
                  {{item.LogisticsStatusText || '--'}}
                </div>
              </div>
            </li>
            <li class="no-border">
              <div class="item-info">
                <label>司机：</label>
                <div class="pull-right">{{item.DisplayLogisticInfo.DriverName || '--'}}</div>
              </div>
              <div class="item-info">
                <label>联系电话：</label>
                <div class="pull-right">{{item.DisplayLogisticInfo.DriverMobile || '--'}}</div>
              </div>
            </li>
            <li>
              <div class="item-info">
                <label>签收人：</label>
                <div class="pull-right">{{item.DisplayLogisticInfo.Receiver || '--'}}</div>
              </div>
              <div class="item-info">
                <label>签收时间：</label>
                <div class="pull-right">{{item.DisplayLogisticInfo.ReceiveDate ? 
                  item.DisplayLogisticInfo.ReceiveDate.replace(/t.*/ig, '') : '--'}}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <template v-if="item.Waybills.length">
        <h4 class="sub-title">物流详情</h4>
        <div class="mod mb60 pb10" v-if="item">
          <ul class="logistics-state">
            <li v-for="(info, index) in item.Waybills" :class="index == 0 ? 'active': ''" :key="index">
            <div class="label pull-left">
              <label>
                {{ state.filter(s => s.Value == info.WaybillStatus)[0].Text }}
              </label>
            </div>
            <div class="date pull-left">{{ info.TransTime.replace(/T/, ' ') }}</div>
          </li>
          </ul>
        </div>
      </template>
    </template>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      item: '',
      state: ''
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
          this.item.Waybills = _.reverse(this.item.Waybills)
          this.$f7.hideIndicator();
        })
    },
    fetchState () {
      this.axios
        .get("/Logistics/GetWaybillState")
        .then(res => {
          this.state = res.data.Data
        })
    }
  },
  beforeMount () {
    this.$f7.showIndicator('加载中...');
    this.fetch()
    this.fetchState()
  }
}
</script>
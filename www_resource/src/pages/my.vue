<template>
  <f7-page name="me">
    <f7-navbar title="我的信息"></f7-navbar>
    <div class="mod my-card mb10">
      <div class="card-header">
        <div class="card-img"><img src="../../static/img/head.png"></div>
        <div class="card-text">
          <span class="name" v-if="item.CustomerName">{{ item.CustomerName }} <i class="icon-authentication"></i></span>
          <span class="user-name" :class="item.CustomerName ? '': 'single-name'">{{ item.Name }}</span></div>
      </div>
    </div>
    <f7-list>
      <li class="">
        <a href="/message/" class="item-link">
          <div class="item-content">
            <div class="item-inner">
              <div class="item-title">
                <i class="icon icon-bell"></i>
                消息中心
              </div>
              <div class="item-after">
                <span class="badge color-red" v-if="newMsgCount">{{newMsgCount}}</span>
              </div>
            </div>
          </div>
        </a>
      </li>
      <li class="">
        <a href="/about/" class="item-link">
          <div class="item-content">
            <div class="item-inner">
              <div class="item-title">
                <i class="icon icon-circle-mark1"></i>
                关于我们
              </div>
              <div class="item-after">
              </div>
            </div>
          </div>
        </a>
      </li>
    </f7-list>

    <f7-list>
      <f7-list-button id="logoutBtn" color="gray">退出登录</f7-list-button>
    </f7-list>

  </f7-page>
</template>

<script>
import api from '../api'
export default {
  data () {
    return {
      item: {
        CustomerName: ''
      },
      newMsgCount: 0,
      actionOpened: false
    }
  },
  methods: {
    fetch () {
      this.axios.get(
        api.app + '/user'
      )
      .then(data => {
        var tmp = data.data.Data
        if (data.data.Success) {
          this.item = tmp
        }
      })
    },
    fetchNewMsgCount () {
      this.axios.get(
        api.app + '/messages/newcount'
      )
      .then(data => {
        var tmp = data.data.Data
        this.newMsgCount = tmp
        window.JPush && window.JPush.setApplicationIconBadgeNumber(tmp)
      })
    }
  },
  mounted () {
    this.fetch()
    this.fetchNewMsgCount()
  }
}
</script>
<style>
.single-name {
  display: block;
  margin-top: 15px; 
  font-size: 18px!important;
}
</style>
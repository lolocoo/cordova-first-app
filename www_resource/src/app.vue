<template>
  <!-- App -->
  <div id="app">

    <!-- Statusbar -->
    <f7-statusbar></f7-statusbar>

    <!-- Main Views -->
    <f7-views tabs toolbar-fixed>
      <f7-view id="index" name="index" main tab url="/home/" active></f7-view>
      <f7-view id="quoted" name="quoted" tab url="/quoted/" navbar-fixed :dynamicNavbar="true"></f7-view>
      <f7-view id="order" name="order" tab url="/carriage/" navbar-fixed :dynamicNavbar="true"></f7-view>
      <f7-view id="my" name="my" tab url="/my/" navbar-fixed :dynamicNavbar="true"></f7-view>

      <f7-toolbar tabbar labels class="toolbar-extend">
        <f7-link tab-link="#index" class="link active" :reloadPages="true">
          <i class="icon icon-home-o"></i>
          <span class="tabbar-label">首 页</span>
        </f7-link>
        <f7-link tab-link="#quoted" view="#quoted" class="link" @click="loadList">
          <i class="icon icon-dialogue-money-o"></i>
          <span class="tabbar-label">抢单报价</span>
        </f7-link>
        <f7-link tab-link="#order" view="#order" class="link" @click="loadOrder">
          <i class="icon icon-car-paper-o"></i>
          <span class="tabbar-label">承运订单</span>
        </f7-link>
        <f7-link tab-link="#my" class="link" :reloadPages="true">
          <i class="icon icon-head-o"></i>
          <span class="tabbar-label">我 的</span>
        </f7-link>
      </f7-toolbar>
    </f7-views>

    <!-- Login Screen -->
    <f7-login-screen id="login-screen">
      <f7-view>
        <f7-pages>
          <f7-page login-screen>
            <div class="login-inx">
              <h1 class="">
                <!-- <i class="logo-zyc"></i> -->
              </h1>
              <ul class="login-input">
                <li class="name">
                  <input type="text" name="username" v-model.trim="user.UserName" placeholder="请输入账户名称">
                  <i class="icon-delete" v-if="user.UserName" @click="clearUserName()"></i>
                </li>
                <li class="password">
                  <input type="password" name="password" v-model="user.Password" placeholder="请输入密码">
                  <i class="icon-eye-close" v-if="user.Password" @click="toggleVisiblePwd($event)"></i>
                </li>
              </ul>
              <div class="text-center mt20"><a class="button button-big button-big-all" href="#" @click.prevent="login">登录</a></div>
            </div>
          </f7-page>
        </f7-pages>
      </f7-view>
    </f7-login-screen>
  </div>
</template>

<script>
export default {
  props: ['env'],
  data () {
    return {
      user: {
        UserName: 'bangyunche',
        Password: '888888',
        AppKey: '780582a8-2ad2-4a8e-86b9-7f89b4ce1524',
        DeviceCode: window.localStorage.getItem('DeviceCode') || 'E14DC3A9-9D5E-45EE-8CAA-868366862173',
        PushToken: window.localStorage.getItem('PushToken') || '643CE6E0-719A-457C-9F1E-9B6BD06E29AB'
      },
      currentTab: 'home',
      loginOpened: false
    }
  },
  methods: {
    login () {
      var vm = this
      this.axios.post(
        'http://test.api.kr.xingyuanauto.com/appmanager/api/user/login',
        this.user
      )
      .then(data => {
        var tmp = data.data
        if (!tmp.Success) {
          this.$f7.toast(tmp.ErrorMessage).show();
          return false
        }
        this.ls.setItem('token', tmp.Data.Token) 
        this.ls.setItem('expireDate', tmp.Data.ExpiryDate)
        this.ls.setItem('isLogin', true)
        this.$bus.$emit('login')
        this.loginOpened = false
        window.f7 && window.f7.closeModal()
        if (!window.f7.getCurrentView().main) {
          window.Dom7('html').addClass('with-statusbar-overlay')
        }
        window.f7.getCurrentView().reinitPage()
      })
      .catch(() => {
        // this.loginOpened = true
      })
    },
    logout () {
      window.f7 && window.f7.closeModal()
      // this.loginOpened = true
      window.f7.loginScreen()
      this.$$('html').removeClass('with-statusbar-overlay')
      window.localStorage.setItem('isLogin', false)
      window.localStorage.setItem('expireDate', '')
    },
    clearUserName () {
      this.user.UserName = ''
    },
    toggleVisiblePwd (e) {
      var icon = this.$$(e.target)
      var inputPwd = icon.prev()
      var inputType = inputPwd.attr('type')

      icon[0].classList.toggle('icon-eye-open')
      inputPwd.attr('type', inputType == 'password' ? 'text' : 'password' )
    },
    // sys functions
    initiatePush () {
      var getRegistrationID = function() {
        window.JPush.getRegistrationID(onGetRegistrationID);
      }
    
      var onGetRegistrationID = function(data) {
        try {
          if (data.length == 0) {
            var t1 = window.setTimeout(getRegistrationID, 1000);
          }
          window.JPush.setAlias({ sequence: 1, alias: data })
          window.localStorage.setItem('PushToken',  data)
        } catch (exception) {
          console.log(exception);
        }
      }

      try {
        window.JPush.init()
        window.JPush.setDebugMode(true)
        window.setTimeout(getRegistrationID, 1000)

        if (device.platform != "Android") {
          window.JPush.setApplicationIconBadgeNumber(0)
        }
      } catch (exception) {
        console.log(exception)
      }
    },
    checkIsExpired () {
      if (
            this.ls.expireDate !== 'undefined' && (this.moment(this.ls.expireDate).diff(this.moment()) < 0) ||
            this.ls.getItem('isLogin') == 'false'
         ) {
        this.logout()
      } else {
        this.loginOpened = false
      }
    },
    setDeviceInfo () {
      this.ls.setItem('device', JSON.stringify(device))
      this.ls.setItem('DeviceCode', device.uuid)
    },
    getAppVersion () {
      var vm = this
      cordova.getAppVersion.getVersionNumber(function (version) {
        vm.ls.setItem('appVersion', version)
      })
    },
    keyBoard () {
      var vm = this
      if (Keyboard) {
        Keyboard.hideFormAccessoryBar(true)
        Keyboard.shrinkView(true)
        // Keyboard.disableScrollingInShrinkView(true)
      }
    },
    deviceReady () {
      var vm = this
      document.addEventListener("resume", function (event) {
        // vm.checkIsExpired()
      }, false);

      window.addEventListener('statusTap', () => {
        document.querySelector('.statusbar-overlay').click()
      }, false)

      vm.getAppVersion()
      vm.setDeviceInfo()
      vm.keyBoard()
      vm.initiatePush()
    },
    loadList () {
      this.$f7.views.quoted.router.reloadPage('/quoted/')
    },
    loadOrder () {
      this.$f7.views.order.router.loadPage('/carriage/')
    },
    onF7Init (f7) {
    },
  },
  created () {
    this.checkIsExpired()
  },
  mounted () {
    var vm = this
    document.addEventListener("deviceready", vm.deviceReady, false)
  }
}
</script>
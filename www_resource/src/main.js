// Import Vue
import Vue from 'vue'

// Import F7
import Framework7 from 'framework7'
import Toast from '../static/toast.js'

// Import axios
import axios from 'axios'
// Import lodash
import _ from 'lodash'
// Import moment
import moment from 'moment'


// Import F7 Vue Plugin
import Framework7Vue from 'framework7-vue'

// Import F7 iOS Theme Styles
import Framework7Theme from 'framework7/dist/css/framework7.ios.min.css'
import Framework7ThemeColors from 'framework7/dist/css/framework7.ios.colors.min.css'
import Framework7IconCss from 'framework7-icons/css/framework7-icons.css'
import ToastCss from '../static/toast.css'
import customeCss from '../static/css/main.css'
/* OR for Material Theme:
import Framework7Theme from 'framework7/dist/css/framework7.material.min.css'
import Framework7ThemeColors from 'framework7/dist/css/framework7.material.colors.min.css'
*/

// Import App Custom Styles
import AppStyles from './css/app.css'

// Import Routes
import Routes from './routes.js'

// Import App Component
import App from './app'

// Import api
import api from './api'


// Init F7 Vue Plugin
Vue.use(Framework7Vue)

const LS = window.localStorage
const DEVICE = JSON.parse(LS.getItem('device')) || {}
let app
let appEnv = {
  AppKey: '780582a8-2ad2-4a8e-86b9-7f89b4ce1524' || '',
  AppVersion: LS.getItem('appVersion') || '1.0.0',
  OS: DEVICE.platform || 'IOS',
  OSVersion: DEVICE.version || '11.2'
}

// Event bus
let EventBus = new Vue()
let timeoutAlert = 0
Object.defineProperties(Vue.prototype, {
  axios: {
    get() {
      let instance = axios.create({
        baseURL: 'http://184.api.kr.xingyuanauto.com/logisticsordertaker/api/',
        withCredentials: true,
        timeout: 5000,
        headers: {
          'App-Env': _.chain(appEnv).entries().map(item => _.join(item, '=')).join(';').value() + ';',
          'Authorization': window.localStorage.getItem('token') || ''
        },
      })

      instance.interceptors.response.use(function (response) {
        if (response.data.ErrorCode == 401) {
          window.f7.loginScreen()
          window.f7.hideIndicator()
          window.localStorage.setItem('isLogin', false)
          window.Dom7('html').removeClass('with-statusbar-overlay')
        }
        return response
      }, function (error) {
        window.f7.hideIndicator()
        if (/timeout/.test(error.message) && !timeoutAlert) {
          timeoutAlert++
          window.f7.confirm('网络超时，请刷新重试',
            function () {
              timeoutAlert--
              window.f7.getCurrentView().refreshPage()
            },
            function () {
              timeoutAlert--
            }
          )
        }
        if (/Network\sError/.test(error.message) && !timeoutAlert && window.localStorage.getItem('isLogin') == 'true') {
          timeoutAlert++
          window.f7.confirm('网络开了小差，请刷新重试',
            function () {
              timeoutAlert--
              window.f7.getCurrentView().refreshPage()
            },
            function () {
              timeoutAlert--
            }
          )
        }
        return Promise.reject(error)
      })
      return instance
    }
  },
  $http: {
    get() {
      return axios
    }
  },
  _: {
    get () {
      return _
    }
  },
  ls: {
    get () {
      return window.localStorage
    }
  },
  moment: {
    get () {
      return moment
    }
  },
  api: {
    get () {
      return api
    }
  },
  $bus: {
    get () {
      return EventBus
    }
  }
})

let noDataPic = require('../static/img/no-data.png')
Vue.component('no-data', {
    template: '<div class="no-data" v-if="value"><img src="' + noDataPic + '"></div>',
    props: ['value']
})

// Init App
app = new Vue({
  el: '#app',
  template: '<app :env="this"/>',
  // Init Framework7 by passing parameters here
  framework7: {
    root: '#app',
    /* Uncomment to enable Material theme: */
    // material: true,
    scrollTopOnStatusbarClick: true,
    statusbarOverlay: true,
    routes: Routes,
    // swipeBackPage: false,
    // animatePages: false
    pushState: true,
    
    // language conf
    modalTitle: '提示',
    modalButtonOk: '确定',
    modalButtonCancel: '取消',
    modalPreloaderTitle: '加载中...'
  },
  // Register App Component
  components: {
    app: App
  }
})


document.addEventListener('DOMContentLoaded', function () {
  (function($){

    $('#index').on('tab:show', function(){
      $('html').removeClass('with-statusbar-overlay')
    })

    $('#quoted, #order, #my').on('tab:show', function(){
      !$('html').hasClass('with-statusbar-overlay') && $('html').addClass('with-statusbar-overlay')
    })

    $('#my').on('tab:show', function(){
      window.f7.views.my.router.refreshPage()
    })
    // form element scrollIntoView
    $(document).on('focusin', 'input, textarea', function (event) {
      // event.target.scrollIntoView()
      var container = $(event.target).closest('.page-content')
      var elementOffset = $(event.target).offset().top
      var pageOffset = container.scrollTop()
      var newPageOffset = pageOffset + elementOffset - 81
      setTimeout(function () {
        container.scrollTop(newPageOffset, 225)
      }, 300)
      setTimeout(function() {
        window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
      }, 700)
    })
    // 
    window.addEventListener('keyboardWillShow', function () {
      window.f7.closeModal()
      $('body').addClass('keyboard-is-open')
    })
    window.addEventListener('keyboardDidHide', function () {
      $('body').removeClass('keyboard-is-open')
    })
    /*
    /* JPush Setting
    /* receive message 
    */
    function onOpenNotification (event) {
      try {
        var alertContent;
        if (device.platform == "Android") {
          alertContent = event.alert;
        } else {
          alertContent = event.aps.alert;
        }
        if (window.localStorage.getItem("isLogin") == "false") return false;
        window.f7.showTab("#my")
        setTimeout(function(){
          window.f7.views.my.router.loadPage("/message/");
        }, 800)
      } catch (exception) {}
    }
    $(document).on("jpush.openNotification", onOpenNotification, false)

    // logout actions
    $(document).on('click', '#logoutBtn', function(){
      let buttons = [
        {
          text: '确认退出',
          color: 'red',
          onClick () {
            app.axios.post(
              api.app + '/user/logout'
            )
            .then(data => {
            })
            window.localStorage.setItem('isLogin', false)
            window.f7.loginScreen()
            window.Dom7('html').removeClass('with-statusbar-overlay')
          }
        }
      ]
      let cancelButton = [
        {
          text: '取消',
        }
      ]
      window.f7.actions([buttons, cancelButton])
    })
  })(window.Dom7)
})



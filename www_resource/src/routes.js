export default [{
    path: '/home/',
    component: require('./pages/home.vue')
  },
  {
    path: '/order/',
    component: require('./pages/order.vue'),
  },
  {
    path: '/order-detail/:id',
    component: require('./pages/orderDetail.vue')
  },
  {
    path: '/send-quoted/:id',
    component: require('./pages/sendQuoted.vue')
  },
  {
    path: '/update-quoted/:id',
    component: require('./pages/updateQuoted.vue')
  },
  {
    path: '/update-logistics/:id/:state',
    component: require('./pages/updateLogistics.vue')
  },
  {
    path: '/my/',
    component: require('./pages/my.vue')
  },
  {
    path: '/about/',
    component: require('./pages/about.vue')
  },
  {
    path: '/message/',
    component: require('./pages/message.vue')
  },
  {
    path: '/message-detail/:id',
    component: require('./pages/messageDetail.vue')
  },
  {
    path: '/carriage/',
    component: require('./pages/carriage.vue'),
    tabs: [
      {
        path: '/',
        tabId: 'pending',
        component: require('./pages/carriageContent.vue')
      },
      {
        path: '/transport',
        tabId: 'transport',
        component: require('./pages/carriageContent.vue')
      },
      {
        path: '/dispatch',
        tabId: 'dispatch',
        component: require('./pages/carriageContent.vue')
      },
      {
        path: '/extract',
        tabId: 'extract',
        component: require('./pages/carriageContent.vue')
      },
      {
        path: '/shipping',
        tabId: 'shipping',
        component: require('./pages/carriageContent.vue')
      },
      {
        path: '/delivery',
        tabId: 'delivery',
        component: require('./pages/carriageContent.vue')
      }
    ]
  },
  {
    path: '/quoted/',
    component: require('./pages/quoted.vue'),
    tabs: [
      {
        path: '/',
        tabId: 'unquoted',
        component: require('./pages/quotedContent.vue')
      },
      {
        path: '/quoted',
        tabId: 'quoted',
        component: require('./pages/quotedContent.vue')
      },
      {
        path: '/bargain',
        tabId: 'bargain',
        component: require('./pages/quotedContent.vue')
      },
    ]
  }
]
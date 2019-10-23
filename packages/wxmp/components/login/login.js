import {dispatch, component, unsubscribe} from '../../mpsm/index'

component({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in login component')
      console.log(newState, oldState)
    },
  },
  computed: {
  },
  behaviors: [],
  properties: {
  },
  data: {},
  created: function () {
  },
  attached: function () {
    console.log('login component attached')
  },
  ready: function() {
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    onShow: function () { console.log('onShow in login component') },
    onPageScroll: function (e) {
      this.setData(e)
    },
    onReachBottom: function () { console.log('onReachBottom') },
  },

  methods: {
    login() {
      dispatch({
        type: 'userInfo/save',
        payload: {
          isLogin: !this.data.isLogin
        }
      })
    },
    loginNotLazy() {
      dispatch({
        type: 'userInfo/save',
        payload: {
          isLogin: !this.data.isLogin
        },
        lazy: false
      })
    }
  }

})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
  }
})

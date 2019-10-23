import {dispatch, component, unsubscribe} from '../../mpsm/index'

import {jumpTo} from '../../utils/util'

component({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in D component')
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
  }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() {
  },

  pageLifetimes: {
    onPageScroll(e) {
      this.setData(e)
    }
  },

  methods: {
    changeMyName() {
      this.dispatch({
        type: 'data',
        payload: {
          name: 'E_' + Math.random().toFixed(3)
        }
      })
    },
  }

})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
  }
})

import {dispatch, component, unsubscribe} from '../../mpsm/index'

import {jumpTo} from '../../utils/util'

component({
  watch: {
    nameC(newState, oldState) {
      console.log('watch nameC in B component')
      console.log(newState, oldState)
    },
    isLogin(newState, oldState) {
      console.log('watch isLogin in B component')
      console.log(newState, oldState)
    },
    groupData(newState, oldState) {
      console.log('watch groupData in B component')
      console.log(newState, oldState)
    }
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
    console.log('this in b', this)
    console.log('this in b', String(this.triggerEvent))
  }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() {
  },

  pageLifetimes: {

  },

  methods: {
    changeMyName() {
      this.dispatch({
        type: 'data',
        payload: {
          name: 'B_' + Math.random().toFixed(3)
        }
      })
    },
  }

})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
  }
}, function(group) {
  console.log('group', group)
  const sort = this.data.groupData.sort
  return {
    nameA: group['nameA' + sort],
    nameC: group.nameC,
    nameD: group.nameD,
  }
})

import {dispatch, component, unsubscribe} from '../../mpsm/index'

import {jumpTo} from '../../utils/util'

component({
  watch: {
    nameB(newState, oldState) {
      console.log('watch nameB in C component')
      console.log(newState, oldState)
    },
    isLogin(newState, oldState) {
      console.log('watch isLogin in C component')
      console.log(newState, oldState)
    },
    groupData(newState, oldState) {
      console.log('watch groupData in C component')
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
          name: 'C_' + Math.random().toFixed(3)
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
    nameB: group.nameB,
    nameD: group.nameD,
  }
})

import {dispatch, component, unsubscribe} from '../../mpsm/index'

import {jumpTo} from '../../utils/util'

component({
  watch: {
    nameB(newState, oldState) {
      console.log('watch nameB in A component')
      console.log(newState, oldState)
    },
    isLogin(newState, oldState) {
      console.log('watch isLogin in A component')
      console.log(newState, oldState)
    },
    groupData(newState, oldState) {
      console.log('watch groupData in A component')
      console.log(newState, oldState)
    }
  },
  computed: {
    sortC(data) {
      return data.sort * 2
    }
  },
  behaviors: [],

  properties: {
    sort: {
      type: null,
      value: 0,
      observer() {
        console.log(this)
      }
    }
  },

  data: {},

  created: function () {
  }, // created中无法访问this.$groups、this.$group
  attached: function () {
    console.log('this.$groups', this.$groups)
    console.log('this.$group', this.$group)
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
          name: 'A_' + Math.random().toFixed(3)
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
  return {
    nameB: group.nameB,
    nameC: group.nameC,
    nameD: group.nameD,
  }
})

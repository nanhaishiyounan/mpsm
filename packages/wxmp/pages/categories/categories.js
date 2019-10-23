import {dispatch, page, unsubscribe} from '../../mpsm/index'

import {jumpTo} from "../../utils/util";


page({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in categories page!')
      console.log(newState, oldState)
    },
    timeout(newState, oldState) {
      console.log('watch timeout in categories page!')
      console.log(newState, oldState)
    }
  },
  computed: {
    countComputed(data) {
      return data.count + 2
    }
  },
  data: {
    count: 0
  },
  onLoad() {
  },
  onUnload() {
    clearInterval(this.interval)
  },
  onShow() {
    console.log('上一页路由', this.data.prev)
  },
  onHide() {
    clearInterval(this.interval)
  },

  effect() {
    dispatch({
      type: 'userInfo/getUserInfo',
      payload: {}
    })
  },
  count() {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      console.log(this.data.count + 1)
      dispatch({
        type: 'userInfo/save',
        payload: {
          count: this.data.count + 1
        },
      })
    }, 2000)
  },
  toAlbumDetail() {
    jumpTo({
      url: '/pages/albumDetail/albumDetail?albumId=123'
    })
  },
  toSoundPage() {
    jumpTo({
      url: '/pages/soundPage/soundPage?trackId=456'
    })
  },

})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
    timeout: userInfo.timeout,
    count: userInfo.count,
    prev: userInfo.prev,
  }
})

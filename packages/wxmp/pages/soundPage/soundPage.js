import {dispatch, page, unsubscribe} from '../../mpsm/index'
import {jumpTo, formatDuration} from "../../utils/util";



page({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in soundPage page!')
      console.log(newState, oldState)
    },
  },
  computed: {
    durationComputed(data) {
      return formatDuration(data.duration)
    },
    currentTimeComputed(data) {
      return formatDuration(data.currentTime)
    },
  },
  onLoad() {
  },
  onUnload() {
  },
  onShow() {
    console.log('上一页路由', this.data.prev)
  },
  onHide() {
  },
  play() {
    dispatch({
      type: 'player/play',
      payload: {
        trackId: 12345
      },
    })
  },
  stop() {
    dispatch({
      type: 'player/stop',
    })
  },
  pause() {
    dispatch({
      type: 'player/pause',
    })
  },
  toMyPage() {
    wx.switchTab({
      url: '/pages/myPage/myPage'
    })
  }
})(({userInfo, player}) => {
  return {
    isLogin: userInfo.isLogin,
    prev: userInfo.prev,
    duration: player.duration,
    status: player.status,
    currentTime: player.currentTime,
  }
})

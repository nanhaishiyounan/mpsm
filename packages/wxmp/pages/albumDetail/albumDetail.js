import {dispatch, page, unsubscribe} from '../../mpsm/index'
import {formatDuration, jumpTo} from "../../utils/util";


page({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in albumDetail page!')
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
    //unsubscribe('userInfo/setup')
  },
  onShow() {
    console.log('上一页路由', this.data.prev)
  },
  onHide() {
    console.log('hide-albumDetail')
  },

  toSoundPage() {
    jumpTo({
      url: '/pages/soundPage/soundPage?trackId=153'
    })
  },
})(({userInfo, player}) => {
  return {
    isLogin: userInfo.isLogin,
    prev: userInfo.prev,
    duration: player.duration,
    status: player.status,
    currentTime: player.currentTime,
  }
})

import {dispatch, page, unsubscribe, subscribe} from '../../mpsm/index'
import {jumpTo} from "../../utils/util";


page({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in myPage page!')
      console.log(newState, oldState)
    },
  },
  data: {
    c: {d:1}
  },
  onLoad() {
    console.log('上一页路由', this.data.prev)
  },
  onShow() {
    console.log('上一页路由', this.data.prev)
  },
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
  },
  unsubscribeHistory() {
    unsubscribe('userInfo/setup') //取消history 监听
  },
  subscribeHistory() {
    subscribe('userInfo/setup') //再次history 监听
  },
  toAlbumDetail() {
    jumpTo({
      url: '/pages/albumDetail/albumDetail?albumId=1234'
    })
  },
  toSoundPage() {
    jumpTo({
      url: '/pages/soundPage/soundPage?trackId=4567'
    })
  },
})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
    prev: userInfo.prev,
  }
})

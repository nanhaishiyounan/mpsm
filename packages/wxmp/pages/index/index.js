import {dispatch, page} from '../../mpsm/index'
import diff from '../../mpsm/diff'
import {jumpTo} from '../../utils/util'

page({
  watch: {
    isLogin(newState, oldState) {
      console.log('watch isLogin in index page!')
      console.log(newState, oldState)
    },
    nameA1(newState, oldState) {
      console.log('watch nameA1 in index page!')
      console.log(newState, oldState)
    },
  },
  data: {
    index: {
      a: 'index-a',
      b: 'index-b',
      c: 'index-c',
      d: 'index-d',
    }
  },
  onLoad() {

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
  changeA1Name() {
    this.dispatch({
      type: 'group/index-a-1',
      payload: {
        nameA1: 'A_' + Math.random().toFixed(3)
      }
    })
  },
  changePageData() {
    this.setData({
      index: {
        a: 'index-a_' + Math.random().toFixed(3),
        b: 'index-b_' + Math.random().toFixed(3),
        c: 'index-c_' + Math.random().toFixed(3),
        d: 'index-d_' + Math.random().toFixed(3),
      }
    })
  },
  toAlbumDetail() {
    jumpTo({
      url: '/pages/albumDetail/albumDetail?albumId=215393753'
    })
  },
  toSoundPage() {
    jumpTo({
      url: '/pages/soundPage/soundPage'
    })
  },
})(({userInfo}) => {
  return {
    isLogin: userInfo.isLogin,
    prev: userInfo.prev,
  }
}, (groups) => {
  return {
    nameA1: groups['index-a-1'] && groups['index-a-1'].nameA1,
    nameA2: groups['index-a-2'] && groups['index-a-2'].nameA2,
  }
})

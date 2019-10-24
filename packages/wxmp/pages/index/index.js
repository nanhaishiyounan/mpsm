import {dispatch, page} from '../../mpsm/index'
import diff from '../../mpsm/diff'
import {jumpTo} from '../../utils/util'
import getIndexAlbums from '../../services/apis/getIndexAlbums'

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
    const r = diff({
      a: 1, b: 2, c: "str", d: { e: [2, { a: 4 }, 5] }, f: true, h: [1], g: { a: [1, 2], j: 111 }
    }, {
      a: [], b: "aa", c: 3, d: { e: [3, { a: 3 }] }, f: false, h: [1, 2], g: { a: [1, 1, 1], i: "delete" }, k: 'del'
    })
    console.log(r)
    // getIndexAlbums().then(albums => console.log(albums))
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

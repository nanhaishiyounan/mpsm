import {throttle} from '../utils/util'

const audioManager = wx.getBackgroundAudioManager()

export default {
  namespace: 'player',
  state: {
    status: -1,
    currentTime: 0,
    duration: 0,
    playList: [],
    trackInfo: {},
    src: '',
  },
  subscriptions: {
    setup({dispatch, history, select}) {
      const statusCallbacks = [
        'onStop',
        'onCanplay',
        'onPlay',
        'onPause',
        'onWaiting',
        'onSeeking',
        'onSeeked',
        'onEnded',
      ]
      statusCallbacks.forEach((cb, index) => audioManager[cb](() => {
        let duration = 0
        if (cb === 'onPlay') {
          dispatch({
            type: 'save',
            payload: {
              duration: audioManager.duration,
              status: index - 1,
            }
          })
          return
        }
        dispatch({
          type: 'save',
          payload: {
            status: index - 1
          }
        })
      }))

      audioManager.onTimeUpdate(throttle(() => {
        const {userInfo} = select()
        if (userInfo.current.route === 'pages/index/index' ||
          userInfo.current.route === 'pages/myPage/myPage' ||
          userInfo.current.route === 'pages/categories/categories'
        ) {
          return
        }
        console.log('onTimeUpdate')
        dispatch({
          type: 'save',
          payload: {
            currentTime: audioManager.currentTime
          }
        })
      }))

      audioManager.onNext(() => {

      })
      audioManager.onPrev(() => {

      })
    }
  },
  effects: {
    async play({payload}, {put, select}) {
      const {trackId}  = payload
      const {player}  = select()
      if (player.trackInfo.trackId === trackId) {
        if (player.status === 1) {
          return
        } else {
          audioManager.play()
        }
      }
      // const {trackInfo, albumInfo, authorizeInfo} = await getTrackInfo(trackId)
      const trackInfo = {
        src: "http://fdfs.xmcdn.com/group21/M07/E1/9A/wKgJKFhaF0-iB9xiAAvVRBPMkEo276.mp3",
        albumTitle: 'albumTitle',
        title: 'trackTitle',
        coverLarge: '',
        trackId
      }
      audioManager.src = trackInfo.src
      audioManager.title = trackInfo.title
      audioManager.epname = trackInfo.albumTitle
      audioManager.coverImgUrl = trackInfo.coverLarge

      put({
        type: '_play',
        payload: {
          trackInfo,
        }
      })
    },
    stop({payload}, {put, select}) {
      audioManager.stop()
      put({
        type: 'save',
        payload: {
          currentTime: 0,
          duration: 0,
          playList: [],
          trackInfo: {},
          src: '',
        }
      })
    },
    pause({payload}, {put, select}) {
      audioManager.pause()
    },
    async more({payload}, {put, select}) {

    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    },
    _play (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },

  }
}

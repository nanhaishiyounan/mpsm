export default {
  namespace: 'userInfo',
  state: {
    isLogin: false,
    timeout: 0,
    count: 0,
    prev: null,
    current: null,
  },
  subscriptions: {
    setup({dispatch, history}) {
      const callback = (current, prev) => {
        dispatch({
          type: 'save',
          payload: {
            prev,
            current
          },
          batch: false,
        })
      }
      history.listen(callback)
      return () => history.unlisten(callback)
    }
  },
  effects: {
    async getUserInfo({payload}, {put, select}) {
      const a = await put({
        type: 'timeout',
        payload: {}
      })
    },
    async timeout({payload}, {put, select}) {
      await new Promise((resolve,reject) => setTimeout(() => resolve('timeout'), 3000))
      console.log('effect')
      await put({
        type: 'save',
        payload: {
          timeout: 3000
        }
      })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }

}

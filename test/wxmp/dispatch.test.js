import {dispatch, put} from '../../packages/wxmp/mpsm/dispatch'

let count = 0

const mockModel = {
  namespace: 'userInfo',
  state: {
    count: 0
  },
  subscriptions: {},
  effects: {
    async timeout({payload}, {put, select}) {
      await new Promise((resolve,reject) => setTimeout(() => resolve('timeout'), 3000))
      await put({
        type: 'save',
        payload: {
          count: payload.count
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

jest.mock('../../packages/wxmp/mpsm/model', () => {
  return {
    select(namespace) {
      return mockModel.namespace === namespace ? mockModel : null
    },
    updateState(model, state) {
      mockModel.state = state
    }
  }
})

jest.mock('../../packages/wxmp/mpsm/notify', () => {
  return () => {}
})


test('test dispatch sync', () => {
  const action = {
    type: 'userInfo/save',
    payload: {
      count: ++count
    }
  }
  dispatch(action)

  expect(mockModel.state).toEqual({
    count: 1
  })
})

test('test put sync', () => {
  const action = {
    type: 'save',
    payload: {
      count: ++count
    }
  }
  put('userInfo', action)

  expect(mockModel.state).toEqual({
    count: 2
  })
})

test('test dispatch async', async () => {
  const action = {
    type: 'userInfo/timeout',
    payload: {
      count: ++count
    }
  }
  await dispatch(action)

  expect(mockModel.state).toEqual({
    count: 3
  })
})

test('test put async', async () => {
  const action = {
    type: 'timeout',
    payload: {
      count: ++count
    }
  }
  await put('userInfo', action)

  expect(mockModel.state).toEqual({
    count: 4,
  })
})



import {select, unsubscribe, initModelsSubscriptions, unsubscriptionFuns, updateState} from '../../packages/wxmp/mpsm/model'

const mockCallback = jest.fn()
const mockUnsubsCallback = jest.fn()

const models = [{
  namespace: 'userInfo',
  state: {
    isLogin: true
  },
  subscriptions: {
    setup() {
      mockCallback()
      return mockUnsubsCallback
    }
  }
}, {
  namespace: 'player',
  state: {
    duration: 123000
  },
  subscriptions: {
    setup() {
      mockCallback()
      return [mockUnsubsCallback, mockUnsubsCallback]
    }
  }
}]

jest.mock('../../packages/wxmp/models/index', () => {
  return [{
    namespace: 'userInfo',
    state: {
      isLogin: true
    },
    subscriptions: {
      setup() {
        mockCallback()
        return mockUnsubsCallback
      }
    }
  }, {
    namespace: 'player',
    state: {
      duration: 123000
    },
    subscriptions: {
      setup() {
        mockCallback()
        return [mockUnsubsCallback, mockUnsubsCallback]
      }
    }
  }]
})

test('test model select', () => {
  expect(select()).toEqual({
    userInfo: {
      isLogin: true
    },
    player: {
      duration: 123000
    }
  })
  expect(JSON.stringify(select('userInfo'))).toEqual(JSON.stringify(models[0]))
  expect(select((state) => state.player.duration)).toEqual(123000)
})

test('test model initModelsSubscriptions', () => {
  initModelsSubscriptions()
  expect(mockCallback.mock.calls.length).toEqual(2)
  expect(unsubscriptionFuns).toEqual({
    userInfo: {
      setup: mockUnsubsCallback
    },
    player: {
      setup: [mockUnsubsCallback,mockUnsubsCallback]
    }
  })
})

test('test model unsubscribe', () => {
  unsubscribe('player/setup')
  expect(mockUnsubsCallback.mock.calls.length).toEqual(2)
})

test('test model updateState', () => {
  updateState(models[0], {a: 1})
  expect(models[0].state).toEqual({a: 1})
})










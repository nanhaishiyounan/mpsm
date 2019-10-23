import {history, notifyHistoryListen, funs, prevRoute} from '../../packages/wxmp/mpsm/history'

const mockCallback = jest.fn()

const mockCurrPage = {
  route: 'pages/myPage/myPage',
  options: {
    userId: 123
  }
}

jest.mock('../../packages/wxmp/mpsm/util', () => {
  return {
    currPage() {
      return mockCurrPage
    },
    clone(obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
})

test('test history', () => {
  history.listen(mockCallback)
  expect(funs).toEqual([mockCallback])
  history.unlisten(mockCallback)
  expect(funs).toEqual([])
})

test('test notifyHistoryListen', () => {
  for (let i = 0; i < 6; i++) {
    history.listen(mockCallback)
  }
  notifyHistoryListen()
  expect(prevRoute).toEqual(mockCurrPage)
  expect(mockCallback.mock.calls.length).toEqual(6)

})








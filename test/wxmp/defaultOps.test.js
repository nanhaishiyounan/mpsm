import {wrapSetData} from "../../packages/wxmp/mpsm/defaultOps"
import {mergeData} from "../../packages/wxmp/mpsm/util"

const mockFn = jest.fn()
const context = {
  data: {
    a: {
      a: 1,
      b: 2
    }
  },
  setData(data) {
    mockFn(data)
    mergeData(data, this.data)
  }
}

jest.mock('../../packages/wxmp/mpsm/model', () => {
  return {
    select() {
      return {
        namespace: 'userInfo',
        state: {
          isLogin: true
        }
      }
    }
  }
})

test('test defaultOps', () => {
  expect('').toEqual('')
})










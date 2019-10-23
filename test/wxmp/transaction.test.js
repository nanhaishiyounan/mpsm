import {performTransaction} from '../../packages/wxmp/mpsm/transaction'
import {prefix} from '../../packages/wxmp/mpsm/util'

let mockPageResult = null
let mockComponentResult = null

const mockPage = {
  [prefix]: {
    _propsWatch: {
      isLogin(newState, oldState) {
        return mockPageResult = [newState, oldState]
      }
    },
    _propsValue: {
      isLogin: true
    },
    _mapPropsToData({userInfo}) {
      return {
        isLogin: userInfo.isLogin
      }
    },
    _components: [{
      _propsWatch: {
        isLogin(newState, oldState) {
          return mockComponentResult = [newState, oldState]
        }
      },
      _propsValue: {
        isLogin: true
      },
      _mapPropsToData(state) {
        return {
          isLogin: state.isLogin
        }
      },
      setData(){
        return {isLogin: true}
      },
    }]
  },
  setData(data){
    return {isLogin: true}
  },

}

const mockState = {
  userInfo: {
    isLogin: false
  }
}

jest.mock('../../packages/wxmp/mpsm/model', () => {
  return {
    select() {
      return mockState
    }
  }
})

test('test performTransaction', () => {
  performTransaction(mockPage)
  expect(mockPageResult).toEqual([false, true])
  setTimeout(() => expect(mockComponentResult).toEqual([false, true]), 0)
})







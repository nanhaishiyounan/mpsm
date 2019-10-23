import {page, component,wrapSetData, COMMON_OPS, COMMON_COMPONENT_OPS} from "../../packages/wxmp/mpsm/page"
import {mergeData, prefix} from "../../packages/wxmp/mpsm/util";

const mockPage = jest.fn()
const mockComponent = jest.fn()
const mockFn = jest.fn()
global.Page = (ops) => {
  mockPage(ops)
}
global.Component = () => {
  mockComponent(ops)
}
const context = {
  data: {
    a: {
      a: 1,
      b: 2
    }
  },
  [prefix]: {

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
    },
    initModelsSubscriptions() {
      return
    }
  }
})

test('test page.init', () => {
  function fn() {}
  const commonPageOps = {
    data: {
      a: 1,
      b: 2,
      e: {
        a: 1,
        b: 2
      }
    },
    type: 1,
    onTap: fn,
    onLoad: fn
  }
  const commonComponenteOps = {
    data: {
      a: 3,
      b: 4
    },
    type: 5
  }
  page.init(commonPageOps, commonComponenteOps)
  expect([COMMON_OPS, COMMON_COMPONENT_OPS]).toEqual([commonPageOps, commonComponenteOps])
  expect(COMMON_OPS.onTap).toEqual(fn)
  expect(COMMON_OPS.onLoad).not.toEqual(fn)
})

test('test page', () => {
  const pageOps = {
    data: {
      a: 3,
      c: 1,
      d: 2,
      e: {
        a: 1
      }
    },
    type: 3,
  }
  page(pageOps)()
  expect(mockPage.mock.calls[0][0].data).toEqual({
    a: 3,
    b: 2,
    c: 1,
    d: 2,
    e: {
      a: 1,
      b: 2
    }
  })
  expect(mockPage.mock.calls[0][0].type).toEqual(3)
})

test('test page wrapSetData', () => {
  wrapSetData(context)
  context.setData({'a.a': 2})
  expect(mockFn.mock.calls[0][0]).toEqual({'a.a': 2})
  expect(context.data).toEqual({
    a: {
      a: 2,
      b: 2
    }
  })
})









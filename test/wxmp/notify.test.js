import notify from '../../packages/wxmp/mpsm/notify'
import {prefix} from '../../packages/wxmp/mpsm/util'
const mockPrefix = prefix
const mockCurrPage = {[mockPrefix]:{}}
const mockPages = [{[mockPrefix]:{}}, {[mockPrefix]:{}}, mockCurrPage, {[mockPrefix]:{}}, {[mockPrefix]:{}}]

jest.mock('../../packages/wxmp/mpsm/util', () => {
  return {
    getPages() {
      return mockPages
    },
    currPage() {
      return mockCurrPage
    }
  }
})

jest.mock('../../packages/wxmp/mpsm/transaction', () => {
  return {
    performTransaction(context) {
      context[mockPrefix] = {}
      context[mockPrefix]._hasTransaction = false
    }
  }
})


test('test notify default lazy', () => {
  notify(true)
  expect(mockPages).toEqual([
    {[mockPrefix]:{_hasTransaction: true}},
    {[mockPrefix]:{_hasTransaction: true}},
    {[mockPrefix]:{_hasTransaction: false}},
    {[mockPrefix]:{_hasTransaction: true}},
    {[mockPrefix]:{_hasTransaction: true}},

  ])
})

test('test notify not lazy', () => {
  notify()
  expect(mockPages).toEqual([
    {[mockPrefix]:{_hasTransaction: false}},
    {[mockPrefix]:{_hasTransaction: false}},
    {[mockPrefix]:{_hasTransaction: false}},
    {[mockPrefix]:{_hasTransaction: false}},
    {[mockPrefix]:{_hasTransaction: false}},
  ])
})





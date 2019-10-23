import * as util from "../../packages/wxmp/mpsm/util"

test('test util.mergeOps', () => {
  function fn() {}
  const ops1 = {
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
  const ops2 = {
    data: {
      a: 3,
      b: 4
    },
    type: 5,
    onLoad: fn
  }
  const result = util.mergeOps(ops1, ops2)
  expect(result).toEqual({
    data: {
      a: 3,
      b: 4,
      e: {
        a: 1,
        b: 2
      }
    },
    type: 5,
    onTap: fn,
    onLoad: fn
  })
  expect(result.onTap).toEqual(fn)
  expect(result.onLoad).toEqual(fn)
})

test('test util.mergeData', () => {
  const changedData = {
    a: {
      a: 1
    },
    b: 2,
    c: {
      a: 1,
      b: 2,
      c: 3
    },
    'd.a.b': 1,
    e: {
      a: 1,
      c: 2
    }
  }
  const targetData = {
    a: {
      b: 1
    },
    b: 3,
    c: {
      a: 1,
      b: 4,
    },
    d: 0,
    e: {
      a: 1,
      b: 2
    }
  }
  const exceptData = {
    a: {
      a: 1
    },
    b: 2,
    c: {
      a: 1,
      b: 2,
      c: 3
    },
    d: {
      a: {
        b: 1
      }
    },
    e: {
      a: 1,
      c: 2
    }
  }
  expect(util.mergeData(changedData, targetData)).toEqual(exceptData)
})

test('test util.getPages', () => {
  const targetPage = {i: 4}
  for (let i = 0; i < 10; i++) {
    util.addPage(i === 4 ? targetPage : {i})
  }
  expect(util.getPages().length).toEqual(10)

  util.removePage(util.getPages()[4])

  expect(util.getPages().length).toEqual(9)

  for (let i = 0; i < 9; i++) {
    expect(util.getPages()[i] === targetPage).toEqual(false)
  }
  let is = []
  util.getPages().forEach((p, i) => {
    is.push(p.i)
  })
  expect(is).toEqual([0,1,2,3,5,6,7,8,9])
})



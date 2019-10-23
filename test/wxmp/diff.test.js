import diff from '../../packages/wxmp/mpsm/diff'

test('test diff() return', () => {
  const changedData = {
    a: {
      b: 1
    },
    b: {
      a: 1,
      b: 2,
      c: 3
    },
    c: {
      d: 2
    },
    d: {
      e: 4,
      f: 5,
      g: 6
    },
    e: {
      a: 1,
      b: 2,
    },
    f: [1, 2, 3],
    g: [1, 2, 3],
    h: [{a: 1}, 2, 3],
    i: [{a: [1, 2, 3, 4], b: 2}, {a: [2, 2, 3], b: 4}, {a: [2, 2, 3], b: 3}],
    j: {
      a: 1,
      b: 2,
    },
    k: {
      a: {
        a: {
          a: 1
        }
      },
      b: 2
    }
  }

  const targetData = {
    a: {
      b: 2
    },
    b: {
      a: 3,
      b: 2,
    },
    c: {
      e: 3
    },
    d: {
      c: 3,
      f: 5,

    },
    e: {
      a: 1,
      c: 2,
    },
    f: [1, 2],
    g: [1, 2, 3, 4],
    h: [1, 2, 3],
    i: [{a: [1, 2, 3], b: 2}, {a: [2, 2, 3], b: 3}],
    j: {
      a: 1,
      c: 2,
    },
    k: {
      a: {
        a: {
          a: 3
        }
      },
      b: {
        a: 1
      }
    }
  }

  const expectData = {
    result: {
      'a.b': 1,
      'b.a': 1,
      'b.c': 3,
      c: {
        d: 2
      },
      d: {
        e: 4,
        f: 5,
        g: 6
      },
      e: {
        a: 1,
        b: 2,
      },
      'f[2]': 3,
      g: [1, 2, 3],
      'h[0]': {
        a: 1
      },
      'i[0].a[3]': 4,
      'i[1].b': 4,
      'i[2]': {a: [2,2,3], b: 3},
      j: {
        a: 1,
        b: 2,
      },
      'k.a.a.a': 1,
      'k.b': 2,
    },
    rootKeys: {
      a: true,
      b: true,
      c: true,
      d: true,
      e: true,
      f: true,
      g: true,
      h: true,
      i: true,
      j: true,
      k: true,
    }
  }

  expect(diff(changedData, targetData)).toEqual(expectData)
})

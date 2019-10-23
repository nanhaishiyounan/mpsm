import {isArray, isFunction, isObject, isUndefined} from './util'

export default function diff(current, prev) {
  const result = {}
  const rootKeys = {}
  _diff(current, prev, '', result, rootKeys)
  return {result, rootKeys}
}

function _diff(current, prev, path, result, rootKeys) {
  Object.keys(current).forEach((key) => {
    if (current[key] === prev[key]) {
      return
    }
    let done = false
    splitKey(key).reduce((t, k, i, arr) => {
      if (done) {
        return
      }
      const fullPath = combineKey(arr, i, path)
      if (i === arr.length - 1) {
        if (isObject(current[key]) && isObject(t[k])) {
          const currentKeys = Object.keys(current[key])
          const prevKeys = Object.keys(t[k])
          let matchResult = null
          if (currentKeys.length < prevKeys.length ||
            (
              matchResult = currentKeys.join(',').match(new RegExp(`\(${prevKeys.join('|')}\)`, 'g')) || [],
              matchResult.length < prevKeys.length
            )
          ) {
            setRootKeys(rootKeys, fullPath)
            setResult(result, fullPath, current[key])
          } else {
            _diff(current[key], t[k], fullPath, result, rootKeys)
          }
        } else if (isArray(current[key]) && isArray(t[k])) {
          if (current[key].length >= t[k].length) {
            _diff(current[key], t[k], fullPath, result, rootKeys)
          } else {
            setRootKeys(rootKeys, fullPath)
            setResult(result, fullPath, current[key])
          }
        } else {
          setRootKeys(rootKeys, fullPath)
          setResult(result, fullPath, current[key])
        }
      } else if (isUndefined(t[k]) || !isObject(t[k]) && !isArray(t[k])) {
        setRootKeys(rootKeys, fullPath)
        setResult(result, key, current[key])
        done = true
      }
      return t[k]
    }, prev)
  })
}

function setResult(result, k, v) {
  if (!isFunction(v) && !result.hasOwnProperty(k)) {
    result[k] = v
  }
}

function setRootKeys(rootKeys, fullPath) {
  rootKeys[splitKey(fullPath)[0]] = true
}

function combineKey(arr, i, path) {
  let key = ''
  for (let j = 0; j <= i; j++) {
    const isArray = /^\d+$/.test(arr[j])
    key += (isArray ? `[${arr[j]}]` : `.${arr[j]}`)
  }
  return `${path}${key}`.replace(/^\./, '')
}

export function splitKey(key) {
  const kArr =  (key + '[]').split(/\.|\[|\]\[|\]\./g)
  kArr.pop()
  return kArr
}

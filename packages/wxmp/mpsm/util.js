const ARRAYTYPE = '[object Array]'
const OBJECTTYPE = '[object Object]'
const FUNCTIONTYPE = '[object Function]'
const UNDEFINEDTYPE = '[object Undefined]'
const NULLTYPE = '[object Null]'
const BOOLEANTYPE = '[object Boolean]'
const STRINGTYPE = '[object String]'
const NUMBERTYPE = '[object Number]'
const ASYNCTYPE = '[object AsyncFunction]'
const GENERATORTYPE = '[object GeneratorFunction]'
const DATETYPE = '[object Date]'
const REGEXPTYPE = '[object RegExp]'

function type(obj) {
  return Object.prototype.toString.call(obj)
}

function is(typeName, obj) {
  return type(obj) === typeName
}
export function isArray(obj) {
  return is(ARRAYTYPE, obj)
}

export function isObject(obj) {
  return is(OBJECTTYPE, obj)
}
export function isDate(obj) {
  return is(DATETYPE, obj)
}
export function isReg(obj) {
  return is(REGEXPTYPE, obj)
}
export function isFunction(obj) {
  return typeof obj === 'function'
}

export function isAsyncFunction(obj) {
  return is(ASYNCTYPE, obj)
}

export function isGeneratorFunction(obj) {
  return is(GENERATORTYPE, obj)
}

export function isUndefined(obj) {
  return is(UNDEFINEDTYPE, obj)
}

export function isNull(obj) {
  return is(NULLTYPE, obj)
}

export function isBool(obj) {
  return is(BOOLEANTYPE, obj)
}

export function isString(obj) {
  return is(STRINGTYPE, obj)
}

export function isNumber(obj) {
  return is(NUMBERTYPE, obj) && obj === obj
}

export function isNaN(obj) {
  return obj !== obj
}

export function mergeOps(firstOps = {},secondOps = {}) {
  Object.keys(firstOps).forEach((key) => {
    if (firstOps[key] === secondOps[key]) {
      return
    }
    if (isUndefined(secondOps[key])) {
      secondOps[key] = firstOps[key]
    } else if (type(firstOps[key]) !== type(secondOps[key])) {
      console.warn(`common options ${key} = ${firstOps[key]} will be overwritten by page optopns ${secondOps[key]}!`)
    } else if (isFunction(firstOps[key])) {
      const rawSecOps = secondOps[key]
      secondOps[key] = function () {
        firstOps[key].apply(this, arguments)
        return rawSecOps.apply(this, arguments)
      }
    } else if (isObject(firstOps[key])) {
      mergeOps(firstOps[key], secondOps[key])
    }
  })
  return secondOps
}

export function mergeData(changedData, oldData) {
  Object.keys(changedData).forEach(key => {
  	const reg = /\.|\[|\]\[|\]\./g
    const kArr = (key + '[]').split(reg)
    const path = (key + '[]').match(reg)
    kArr.pop()
    kArr.reduce((t, k, i, arr) => {
      if (i === arr.length -1) {
        t[k] = changedData[key]
      } else if (!isObject(t[k]) && !isArray(t[k])) {
        t[k] = path[i] === '.' ? {} : []
      }
      return t[k]
    }, oldData)
  })
  return oldData
}

const PAGES = []

export function getPages() {
  return PAGES
}

export function addPage(pageIns) {
  PAGES.push(pageIns)
}

export function removePage(pageIns) {
  const index = PAGES.indexOf(pageIns)
  PAGES.splice(index, 1)
}

export function currPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

export function clone(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return obj
  }
  const cloneObj = isObject(obj) ? {} : []
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      cloneObj[key] = (isObject(obj[key]) || isArray(obj[key])) ? clone(obj[key]) : obj[key]
    }
  }
  return cloneObj
}
export function canWriteSetData(context) {
  const descriptor = Object.getOwnPropertyDescriptor(context, 'setData')
  return descriptor && descriptor.writable
}
export const prefix = '_mpsm_'
export const $setDataKey = '$setData'

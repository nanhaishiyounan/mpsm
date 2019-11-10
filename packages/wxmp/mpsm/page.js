import {clone, mergeOps, isFunction, isObject, mergeData, isUndefined, isArray, prefix, canWriteSetData} from "./util"
import {setModels, initModelsSubscriptions} from "./model"
import {defaultOps, defaultComponentOps} from "./defaultOps"
import diff from "./diff"

export let COMMON_OPS = {}
export let COMMON_COMPONENT_OPS = {}

const excludedWrapFunctionKeys = ['data', 'behaviors', 'export', 'created']
const excludedWrapFunctions = [String, Number, Boolean, Object, Array, Function, RegExp, Date, Error]
const mapWrapFunctionLevel = 5

export function page(ops, isComponent = false) {
  return function (mapPropsToData = null, mapGroupToData = null) {
    if (!isObject(ops)) {
      ops = {}
    }
    ops[prefix] = {
      _mapPropsToData: mapPropsToData,
      _mapGroupToData: mapGroupToData,
      _computed: ops.computed || {},
      _propsWatch: ops.watch || {},
      _propsValue: {},
    }

    delete ops.watch
    delete ops.computed

    if (isComponent) {
      registerComponent(ops)
    } else {
      registerPage(ops)
    }
  }
}

export function component(ops) {
  return page(ops, true)
}

page.init = function (models = [], commonOps = {}, commonComponentOps = {}) {
  commonOps = mergeOps(defaultOps, commonOps)
  commonComponentOps = mergeOps(defaultComponentOps, commonComponentOps)
  COMMON_OPS = commonOps
  COMMON_COMPONENT_OPS = commonComponentOps
  setModels(models)
  initModelsSubscriptions()
}

export function getOps() {
  return clone(COMMON_OPS)
}

export function getComponentOps() {
  return clone(COMMON_COMPONENT_OPS)
}

function registerPage(ops) {
  const newOps = mergeOps(COMMON_OPS, ops)
  mapFuctionToWrap(newOps)
  Page(newOps)
}

function registerComponent(ops) {
  ops[prefix]._pageLifetimes = ops.pageLifetimes || {}
  delete ops.pageLifetimes
  if (isObject(ops.lifetimes)) {
    ops = {...ops, ...ops.lifetimes}
    delete ops.lifetimes
  }

  const newOps = mergeOps(COMMON_COMPONENT_OPS, ops)
  if (isFunction(ops[prefix]._propsWatch.groupData)) {
    newOps.properties.groupData.observer = ops[prefix]._propsWatch.groupData
    delete ops[prefix]._propsWatch.groupData
  }
  const rawCreated = newOps.created
  newOps.created = function () {
    return rawCreated.call(this, newOps)
  }
  mapFuctionToWrap(newOps)
  Component(newOps)
}

function mapFuctionToWrap(obj, level = mapWrapFunctionLevel) {
  if (level <= 0 || !isObject(obj)) {
    return
  }
  Object.keys(obj).forEach(key => {
    if (level === mapWrapFunctionLevel && (excludedWrapFunctionKeys.indexOf(key) !== -1)) {
      return
    }
    if (isFunction(obj[key]) && excludedWrapFunctions.indexOf(obj[key]) === -1) {
      obj[key] = wrapFunction(obj[key])
    } else if (isObject(obj[key]) || isArray(obj[key])) {
      mapFuctionToWrap(obj[key], level - 1)
    }
  })
}

function wrapFunction(fn) {
  const result = {data: {}, callbacks: []}
  return function() {
    beforeFunction(this, result)
    const returnValue = fn.apply(this, arguments)
    afterFunction(this, result)
    return returnValue
  }
}

export function wrapSetData(context) {
  const originSetData = context.setData
  const setDataKey = canWriteSetData(context) ? 'setData' : '$setData'
  context[setDataKey] = function (data) {
    if (!isObject(arguments[0])) {
      data = this.data
    }
    if (!isObject(data) || Object.keys(data).length === 0) {
      return
    }

    let computedResult = {}

    const computed = this[prefix]._computed
    if (isObject(computed) && Object.keys(computed).length > 0) {
      let cloneThisData = clone(this.data)
      let cloneData = clone(data)
      const newData = mergeData(cloneData, cloneThisData)
      computedResult = getComputed(this, newData)
    }

    const {result, rootKeys} = diff({...data, ...computedResult}, this.data)

    if (Object.keys(result).length === 0) {
      return rootKeys
    }
    originSetData.call(this, result, arguments[1])
    return rootKeys
  }
  context[prefix]._hasWrapSetData = true
  context[prefix]._originSetData = originSetData
  context[prefix]._wrapSetData = context[setDataKey]
}

function beforeFunction(context, result) {
  if (!context || !context[prefix]) {
    return
  }
  if (!context[prefix]._hasWrapSetData) {
    wrapSetData(context)
  }

  const setDataKey = canWriteSetData(context) ? 'setData' : '$setData'
  context[setDataKey] = function () {
    if (!isObject(arguments[0])) {
      result.data = context.data
    } else {
      result.data = {...result.data, ...arguments[0]}
    }

    if (isFunction(arguments[1])) {
      result.callbacks.push(arguments[1])
    }
  }

}

function afterFunction(context, result) {
  if (!context || !context[prefix]) {
    return
  }
  if (Object.keys(result.data).length) {
    if (result.callbacks.length) {
      const callback = function () {
        result.callbacks.forEach(cb => cb.apply(this, arguments))
      }
      context[prefix]._wrapSetData.call(context, result.data, callback)
    } else {
      context[prefix]._wrapSetData.call(context, result.data)
    }

  }
  const setDataKey = canWriteSetData(context) ? 'setData' : '$setData'
  result.data = {}
  result.callbacks = []
  context[setDataKey] = context[prefix]._wrapSetData
}

function getComputed(context, newData) {
  const computedResult = {}
  const data = clone(newData)
  if (isObject(context[prefix]._computed)) {
    Object.keys(context[prefix]._computed).forEach(key => {
      if (!isFunction(context[prefix]._computed[key])) {
        return
      }
      computedResult[key] = context[prefix]._computed[key].call(context, data)
    })
  }
  return computedResult
}


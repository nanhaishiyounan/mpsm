import {clone, mergeOps, isFunction, isObject, mergeData, isUndefined, isArray, prefix, $setDataKey} from "./util"
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
  ops[prefix]._properties = ops.properties || {}
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
  return function() {
    beforeFunction(this)
    let returnValue = undefined
    try {
      returnValue = fn.apply(this, arguments)
    } catch (err) {
      console.log(err)
    }
    afterFunction(this)
    return returnValue
  }
}

export function wrapSetData(context) {
  const originSetData = context.setData
  context[prefix]._wrapSetData = function (data) {
    if (!isObject(arguments[0])) {
      data = this.data
    }
    if (!isObject(data) || Object.keys(data).length === 0) {
      return
    }

    let cloneThisData = this[prefix]._cloneData

    const {result, rootKeys} = diff(data, cloneThisData)

    if (Object.keys(result).length === 0) {
      return rootKeys
    }
    originSetData.call(this, result, arguments[1])

    const computed = this[prefix]._computed
    let computedResult = {}
    if (isObject(computed) && Object.keys(computed).length > 0) {
      const {result} = diff(getComputed(this, this.data), this.data)
      computedResult = result
      if (Object.keys(computedResult).length > 0) {
        originSetData.call(this, computedResult)
      }
    }
    mergeData(clone({...result, ...computedResult}), cloneThisData)
    return rootKeys
  }
  context[prefix]._hasWrapSetData = true
  context[prefix]._originSetData = originSetData
}

function beforeFunction(context) {
  if (!context || !context[prefix]) {
    return
  }
  if (!context[prefix]._hasWrapSetData) {
    wrapSetData(context)
  }
  context[prefix]._batch += 1
  context[$setDataKey] = function () {
    addBatchData(context, arguments)
  }

}
function addBatchData(context, args) {
  const batchData = context[prefix]._batchData
  if (!isObject(args[0])) {
    batchData.data = context.data
  } else {
    batchData.data = {...batchData.data, ...args[0]}
  }

  if (isFunction(args[1])) {
    batchData.callbacks.push(args[1])
  }
}
function updateBatchData(context) {
  const batchData = context[prefix]._batchData
  const wrapSetData = context[prefix]._wrapSetData
  if (Object.keys(batchData.data).length) {
    if (batchData.callbacks.length) {
      const callback = function () {
        batchData.callbacks.forEach(cb => cb.apply(this, arguments))
      }
      wrapSetData.call(context, batchData.data, callback)
    } else {
      wrapSetData.call(context, batchData.data)
    }

  }
  batchData.data = {}
  batchData.callbacks = []
  context[$setDataKey] = wrapSetData
  context[prefix]._batch = 0
}

function afterFunction(context) {
  if (!context || !context[prefix]) {
    return
  }
  const batch = context[prefix]._batch
  if (batch <= 1) {
    updateBatchData(context)
  } else {
    context[prefix]._batch -= 1
  }
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


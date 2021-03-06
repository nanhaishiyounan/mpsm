import {
  currPage,
  isFunction,
  isObject,
  clone,
  addPage,
  removePage,
  prefix,
  isArray,
  $setDataKey,
  isUndefined, isNumber, mergeData
} from "./util"
import {notifyHistoryListen} from "./history"
import {performTransaction} from "./transaction"
import {select, selectGroup, addSubscriber} from "./model"
import {dispatchGroup} from "./dispatch"
import diff from "./diff";

const lifetimesName = ['onShow', 'onHide', 'onResize', 'onPageScroll', 'onTabItemTap', 'onPullDownRefresh', 'onReachBottom']

export const defaultOps = {
  [prefix]: {
    _propsValue: {},
    _hasTransaction: [],
    _hasWrapSetData: false,
    _isPage: true,
    _groups: {},
    _components: [],
    _groupNamesNeedUpdate: [],
    _firstOnShow: true,
    _lifetimes: {},
		_cloneData: {},
    _batch: 0,
    _batchData: {data: {}, callbacks: []},
    _subscribers: {},
    _initDone: false,
  },
  onLoad() {
    if (this[prefix]._initDone) {
      return
    }
    this.dispatch = dispatchGroup
    this.update = update
    initCloneData(this)
    add$groupsToThis(this)
    addPage(this)
    add$setDataSyncToThis(this)
    notifyHistoryListen()
    initModelToProps(this)
    initGroupToProps(this)
    initPropsToData(this)
    initDataToComputed(this)
    this[prefix]._initDone = true
  },
  onUnload() {
    removePage(this)
  },
  ...genPageLifetimes()
}

const defaultComponentLifetimes = {
  created(ops) {
    if (this[prefix] && this[prefix]._initDone) {
      return
    }
    this[prefix] = {
      _pageLifetimes: ops[prefix]._pageLifetimes,
      _mapPropsToData: ops[prefix]._mapPropsToData,
      _mapGroupToData: ops[prefix]._mapGroupToData,
      _propsWatch: ops[prefix]._propsWatch,
      _propsValue: ops[prefix]._propsValue,
      _computed: ops[prefix]._computed,
      _properties: ops[prefix]._properties,
      _components: [],
      _isComponent: true,
      _hasWrapSetData: false,
      _cloneData: {},
      _batch: 0,
      _batchData: {data: {}, callbacks: []},
      _hasDetached: false,
      _initDone: false,
    }
    this.dispatch = dispatchGroup
    this.update = update
  },
  attached() {
    if (this[prefix]._initDone) {
      return
    }
    this[prefix]._page = currPage()
    if (this.data.groupName) {
      this[prefix]._indexOfComponents = this[prefix]._page[prefix]._components.push(this) - 1
    }
    subscribePageLifetimes(this[prefix]._page, this)
    initCloneData(this)
    add$groupsToThis(this)
    add$groupToThis(this)
    add$pageToThis(this)
    add$setDataSyncToThis(this)
    initModelToProps(this)
    initGroupToProps(this)
    initPropsToData(this)
    initDataToComputed(this)
    proxyProperties(this)
    this[prefix]._initDone = true
  },
  detached() {
    this[prefix]._hasDetached = true
  },
}

export const defaultComponentOps = {
  properties: {
    'groupName': {
      type: null,
      value: null
    },
    'groupKeys': {
      type: Object,
      value: {}
    },
    'groupData': {
      type: null,
      value: null,
    },
  },
  ...defaultComponentLifetimes,
}

function genPageLifetimes() {
  const lifetimes = {}
  lifetimesName.forEach(name => {
    if (name === 'onShow') {
      lifetimes[name] = function () {
        if (!this[prefix]._firstOnShow) {
          notifyHistoryListen()
        }
        this[prefix]._firstOnShow = false
        if (this[prefix]._hasTransaction.length) {
          performTransaction(this[prefix]._hasTransaction, this)
        }
        if (this[prefix]._groupNamesNeedUpdate.length) {
          performTransaction('', this, this[prefix]._groupNamesNeedUpdate)
        }
        const components = this[prefix]._lifetimes[name]
        if (!components) {
          return
        }
        mapComponentsOnPageLifetimes(components, name, arguments)
      }
    } else {
      lifetimes[name] = function () {
        const components = this[prefix]._lifetimes[name]
        if (!components) {
          return
        }
        mapComponentsOnPageLifetimes(components, name, arguments)
      }
    }
  })
  return lifetimes
}
function subscribePageLifetimes(pageIns, componentIns) {
  const componentLifetimes = componentIns[prefix]._pageLifetimes
  const lifetimes = pageIns[prefix]._lifetimes
  if (!isObject(componentLifetimes)) {
    return
  }
  Object.keys(componentLifetimes).forEach(lifetimeName => {
    if (!lifetimes[lifetimeName]) {
      lifetimes[lifetimeName] = []
    }
    lifetimes[lifetimeName].push(componentIns)
  })
}
function mapComponentsOnPageLifetimes(components, lifetimeName, arg) {
  components.forEach(component => {
    if (!component || !isObject(component[prefix]._pageLifetimes) ||
      !isFunction(component[prefix]._pageLifetimes[lifetimeName])) {
      return
    }
    setTimeout(() => {
      component[prefix]._pageLifetimes[lifetimeName].apply(component, arg)
    }, 0)

  })
}

function collectSubscribers(context, obj) {
  const modelNamespaces = Object.keys(obj)
  const descripors = {}

  for (let i = 0; i < modelNamespaces.length; i++) {
    const value = obj[modelNamespaces[i]]
    descripors[modelNamespaces[i]] = {
      get() {
        addSubscriber(modelNamespaces[i], context)
        return value
      }
    }
  }
  Object.defineProperties(obj, descripors)
}

function initModelToProps(context) {
  if (isFunction(context[prefix]._mapPropsToData)) {
    const state = select()
    collectSubscribers(context, state)
    const newProps = context[prefix]._mapPropsToData.call(context, state)
    if (!isObject(newProps)) {
      throw new Error(`${String(this[prefix]._mapPropsToData)} must return a Object type!`)
    }
    context[prefix]._propsValue = {...context[prefix]._propsValue, ...newProps}
    return true
  }
}

function initGroupToProps(context) {
  if (isFunction(context[prefix]._mapGroupToData) &&
    (
      context[prefix]._isComponent && context.data.groupName ||
      !context[prefix]._isComponent
    )
  ) {
    const newProps = context[prefix]._mapGroupToData.call(context, selectGroup(context))
    if (!isObject(newProps)) {
      throw new Error(`${String(context[prefix]._mapGroupToData)} must return a Object type!`)
    }
    context[prefix]._propsValue = {...context[prefix]._propsValue, ...newProps}
    return true
  }
}

function initPropsToData(context) {
  const props = context[prefix]._propsValue
  context[prefix]._wrapSetData.call(context, props)
}
function initCloneData(context) {
  context[prefix]._cloneData = clone(context.data)
}

function initDataToComputed(context) {
  const props = context[prefix]._propsValue
  if (!isObject(props) ||  Object.keys(props).length === 0) {
    updateComputed(context)
  }
}

function add$groupsToThis(context) {
  Object.defineProperty(context, "$groups", {
    get : function(){
      if (context[prefix]._isPage) {
        return clone(this[prefix]._groups)
      } else {
        return clone(this[prefix]._page[prefix]._groups)
      }
    },
    enumerable : false,
    configurable : false
  })
}

function add$groupToThis(context) {
  Object.defineProperty(context, "$group", {
    get : function(){
      if (!context[prefix] ||
        !context[prefix]._isComponent ||
        !isObject(context.data) ||
        !context.data.groupName) {
        return {}
      }
      const groups = this[prefix]._page[prefix]._groups
      const group = groups[context.data.groupName]
      if (isObject(group) || isArray(group)) {
        return clone(group)
      } else {
        return {}
      }
    },
    enumerable : false,
    configurable : false
  })
}

function add$pageToThis(context) {
  Object.defineProperty(context, "$page", {
    get : function(){
      return this[prefix]._page
    },
    enumerable : false,
    configurable : false
  })
}

function add$setDataSyncToThis(context) {
  Object.defineProperty(context, "$setDataSync", {
    get : function(){
      return this[prefix]._wrapSetData
    },
    set: function(v) {
      return this[prefix]._wrapSetData
    },
    enumerable : false,
    configurable : false
  })
}



function update() {
  this[prefix]._wrapSetData.call(this, null, arguments[0])
}

function proxyProperties(context) {
  const properties = context[prefix]._properties
  if (!isObject(properties) ||
      Object.keys(properties).length === 0
  ) {
    return
  }
  const keys = Object.keys(properties)
  keys.forEach(key => {
    let _v = context.data[key]
    Object.defineProperty(context.data, key, {
      get() {
        return _v
      },
      set(v) {
        if (v === _v) {
          return
        }
        _v = v
        updateComputed(context)
        return v
      }
    })
  })
}
function updateComputed(context) {
  const computed = context[prefix]._computed
  if (isObject(computed) &&
      Object.keys(computed).length
  ) {
    const computedResult = {}
    Object.keys(computed).forEach(key => {
      if (!isFunction(computed[key])) {
        return
      }
      computedResult[key] = computed[key](context.data)
      updateCloneData(context, key, computedResult[key])
    })
    const {result} = diff(computedResult, context.data)
    context[prefix]._originSetData.call(context, result)
  }
}
function updateCloneData(context, propsKey, propValue) {
  context[prefix]._cloneData[propsKey] = propValue
}





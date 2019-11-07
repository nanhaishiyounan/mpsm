import {currPage, isFunction, isObject, clone, addPage, removePage, prefix, isArray} from "./util"
import {notifyHistoryListen} from "./history"
import {performTransaction} from "./transaction"
import {select, selectGroup} from "./model"
import {dispatchGroup} from "./dispatch"

const lifetimesName = ['onShow', 'onHide', 'onResize', 'onPageScroll', 'onTabItemTap', 'onPullDownRefresh', 'onReachBottom']

export const defaultOps = {
  [prefix]: {
    _propsValue: {},
    _hasTransaction: false,
    _hasWrapSetData: false,
    _isPage: true,
    _groups: {},
    _components: [],
    _groupNamesNeedUpdate: [],
    _firstOnShow: true,
    _lifetimes: {}
  },

  onLoad() {
    this.dispatch = dispatchGroup
    add$groupsToThis(this)
    addPage(this)
    initModelToProps(this)
    initGroupToProps(this)
    initPropsToData(this)
    initDataToComputed(this)
    notifyHistoryListen()
  },
  onUnload() {
    removePage(this)
  },
  ...genPageLifetimes()
}

const defaultComponentLifetimes = {
  created(ops) {
    this[prefix] = {
      _pageLifetimes: ops[prefix]._pageLifetimes,
      _mapPropsToData: ops[prefix]._mapPropsToData,
      _mapGroupToData: ops[prefix]._mapGroupToData,
      _propsWatch: ops[prefix]._propsWatch,
      _propsValue: ops[prefix]._propsValue,
      _computed: ops[prefix]._computed,
      _components: [],
      _isComponent: true,
      _hasWrapSetData: false,
    }
    this.dispatch = dispatchGroup
  },
  attached() {
    this[prefix]._page = currPage()
    this[prefix]._indexOfComponents = this[prefix]._page[prefix]._components.push(this) - 1
    subscribePageLifetimes(this[prefix]._page, this)
    add$groupsToThis(this)
    add$groupToThis(this)
    add$pageToThis(this)
    initModelToProps(this)
    initGroupToProps(this)
    initPropsToData(this)
    initDataToComputed(this)
  },
  detached() {
    this[prefix]._page[prefix]._components[this[prefix]._indexOfComponents] = null
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
        if (this[prefix]._hasTransaction) {
          performTransaction(this)
        }
        if (this[prefix]._groupNamesNeedUpdate.length) {
          performTransaction(this, this[prefix]._groupNamesNeedUpdate)
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

function initModelToProps(context) {
  if (isFunction(context[prefix]._mapPropsToData)) {
    const newProps = context[prefix]._mapPropsToData.call(context, select())
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

function initDataToComputed(context) {
  const props = context[prefix]._propsValue
  const computed = context[prefix]._computed
  if (!isObject(props) ||  Object.keys(props).length === 0) {
    if (isObject(computed) &&
      Object.keys(computed).length
    ) {
      const computedResult = {}
      Object.keys(computed).forEach(key => {
        if (!isFunction(computed[key])) {
          return
        }
        computedResult[key] = computed[key](clone(context.data || {}))
      })
      context.setData(computedResult)
    }
  }
}

function initPropsToData(context) {
  const props = context[prefix]._propsValue
  context.setData(props)
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



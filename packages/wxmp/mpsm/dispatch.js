import {isObject, isString, isUndefined, prefix, $setDataKey, clone} from "./util"
import {select, updateState, updateStateGroup} from "./model"
import notify, {notifyGroup} from "./notify"


export function dispatch({type, payload, lazy = true, batch = true}) {
  const [namespace, reducer] = type.split('/')
  const model = select(namespace)
  const oldState = model.state
  if (model.effects && model.effects[reducer]) {
    const effect = model.effects[reducer]
    return effect({
      type,
      payload
    }, {
      put(putAction) {
        return put(namespace, putAction)
      },
      select,
    })
  }
  if (model.reducers && model.reducers[reducer]) {
    const state = model.reducers[reducer](clone(oldState), {type, payload})
    updateState(model, state)
    notify(lazy, batch)
  }
}



export function put(namespace, putAction) {
  let type = ''
  if (putAction.type.split('/').length === 2) {
    type = putAction.type
  } else {
    type = `${namespace}/${putAction.type}`
  }
  const {payload, batch} = putAction
  return dispatch({type, payload, batch})
}

export function dispatchGroup({type, payload, batch = true}) {
  if (!isObject(this[prefix])) {
    return
  }
  const isPageDispatch = this[prefix]._isPage
  const isComponentDispatch = this[prefix]._isComponent && this.data.groupName
  if (!isPageDispatch && !isComponentDispatch) {
    return
  }
  if (!isObject(payload)) {
    throw new Error(`payload: ${payload} in this.dispatch(payload) must be a Object type!`)
  }
  if(Object.keys(payload).length === 0) {
    return
  }

  const typeAndName = type.split('/')
  const updateType = typeAndName[0]
  const groupName = isPageDispatch ? typeAndName[1] : this.data.groupName
  if (!isString(groupName) || !groupName) {
    return
  }
  if (updateType === 'data') {
    this[prefix]._wrapSetData.call(this, payload)
  }

  if (updateType === 'data' || updateType === 'group') {
    let newPayload = {}
    const groupKeys = this.data.groupKeys

    if (
      isComponentDispatch &&
      isObject(groupKeys) &&
      Object.keys(groupKeys).length
    ) {
      Object.keys(payload).forEach(k => {
        const newK = isString(groupKeys[k]) ? groupKeys[k] : k
        newPayload[newK] = payload[k]
      })
    } else {
      newPayload = payload
    }

    let groups = {}
    let pageIns = {}
    if (isPageDispatch) {
      groups = this[prefix]._groups || {}
      pageIns = this
    } else {
      groups = this[prefix]._page[prefix]._groups || {}
      pageIns = this[prefix]._page
    }
    const prevState = groups[groupName] || {}
    const state = {...prevState, ...newPayload}
    updateStateGroup(groups, groupName, state)
    notifyGroup(pageIns, groupName, batch)
  }
}



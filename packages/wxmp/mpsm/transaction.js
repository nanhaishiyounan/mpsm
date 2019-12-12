import {clone, isArray, isFunction, isObject, prefix, $setDataKey} from "./util"
import {select, selectGroup} from "./model"
import diff from "./diff"

export function transaction(context, isGroup, batch) {
  const mapToData = isGroup ? context[prefix]._mapGroupToData : context[prefix]._mapPropsToData
  if (!isFunction(mapToData)) {
    return
  }
  const state = isGroup ? selectGroup(context) : select()
  const newProps = mapToData.call(context, state) || {}
  updatePropsAndData(context, newProps, batch)
}

export function performTransaction(namespace, pageIns, groupNamesNeedUpdate, batch) {
  const isGroup = groupNamesNeedUpdate && groupNamesNeedUpdate.length
  // transaction(pageIns, isGroup, batch)
  if (isGroup) {
    pageIns[prefix]._groupNamesNeedUpdate = []
  } else {
    pageIns[prefix]._hasTransaction = []
  }



  if (namespace) {
    let instances = []
    if (isArray(namespace)) {
      namespace.forEach(name => {
        if (!pageIns[prefix]._subscribers[name]) {
          return
        }
        pageIns[prefix]._subscribers[name].forEach(ins => {
          if (instances.indexOf(ins) === -1) {
            instances.push(ins)
          }
        })
      })
    } else {
      instances = pageIns[prefix]._subscribers[namespace]
    }

    if (!instances || instances.length === 0) {
      return
    }
    instances.forEach(component => {
      if (component[prefix]._hasDetached) {
        return
      }
      transaction(component, isGroup, batch)
    })
  } else {
    transaction(pageIns, isGroup, batch)
    if (pageIns[prefix]._components.length === 0) {
      return
    }

    pageIns[prefix]._components.forEach(component => {
      if (component === null ||
        isGroup && groupNamesNeedUpdate.indexOf(component.data.groupName) === -1
      ) {
        return
      }
      transaction(component, isGroup, batch)
    })
  }

}

export function updatePropsAndData(context, newProps, batch) {
  if (!isObject(newProps)) {
    throw new Error(`mapGroupToData or mapPropsToData function must return a Object type!`)
  }
  const oldProps = context[prefix]._propsValue || {}
  const {result} = diff(newProps, oldProps)
  if (Object.keys(result).length === 0) {
    return
  }
  context[prefix]._propsValue = {...context[prefix]._propsValue, ...newProps}
  const setData = batch ? context[$setDataKey] : context[prefix]._wrapSetData
  const rootKeys = setData.call(context, result)

  if (!isObject(rootKeys)) {
    return
  }

  Object.keys(rootKeys).forEach(key => {
    if (!isFunction(context[prefix]._propsWatch[key])) {
      return
    }
    const newState = (isObject(newProps[key]) ||
        isArray(newProps[key])) ?
        clone(newProps[key]) : newProps[key]
    const oldState = (isObject(newProps[key]) ||
        isArray(newProps[key])) ?
        clone(oldProps[key]) : oldProps[key]

    context[prefix]._propsWatch[key].call(context, newState, oldState)
  })
}
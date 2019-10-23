import {clone, isArray, isFunction, isObject, prefix} from "./util"
import {select, selectGroup} from "./model"
import diff from "./diff"

export function transaction(context, isGroup) {
  const mapToData = isGroup ? context[prefix]._mapGroupToData : context[prefix]._mapPropsToData
  if (!isFunction(mapToData)) {
    return
  }
  const state = isGroup ? selectGroup(context) : select()
  const newProps = mapToData.call(context, state) || {}
  updatePropsAndData(context, newProps)
}

export function performTransaction(pageIns, groupNamesNeedUpdate) {
  const isGroup = groupNamesNeedUpdate && groupNamesNeedUpdate.length
  transaction(pageIns, isGroup)
  if (isGroup) {
    pageIns[prefix]._groupNamesNeedUpdate = []
  } else {
    pageIns[prefix]._hasTransaction = false
  }

  if (pageIns[prefix]._components.length === 0) {
    return
  }

  pageIns[prefix]._components.forEach(component => {
    if (component === null ||
      isGroup && groupNamesNeedUpdate.indexOf(component.data.groupName) === -1
    ) {
      return
    }
    setTimeout(() => {
      transaction(component, isGroup)
    }, 0)
  })
}

export function updatePropsAndData(context, newProps) {
  if (!isObject(newProps)) {
    throw new Error(`mapGroupToData or mapPropsToData function must return a Object type!`)
  }
  const oldProps = context[prefix]._propsValue || {}
  const {result} = diff(newProps, oldProps)
  if (Object.keys(result) === 0) {
    return
  }
  context[prefix]._propsValue = {...context[prefix]._propsValue, ...newProps}

  const rootKeys = context.setData(result)

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
import {clone, isArray, isFunction, isObject, isString, prefix} from "./util"
import {put} from "./dispatch"
import {history} from "./history"

let models = []
let modelsState = {}

export function addSubscriber(namespace, instance) {

  let subscribers = {}
  if (instance[prefix]._isComponent) {
    subscribers = instance[prefix]._page[prefix]._subscribers
  } else {
    subscribers = instance[prefix]._subscribers
  }
  if (!subscribers[namespace]) {
    subscribers[namespace] = []
  }
  if (subscribers[namespace].indexOf(instance) === -1) {
    subscribers[namespace].push(instance)
  }

}
export function select(target) {
  if (isString(target)) {
    for (let i = 0;i < models.length; i++) {
      if (models[i].namespace === target) {
        return  models[i]
      }
    }
  }
  return isFunction(target) ? target(clone(modelsState)) : clone(modelsState)
}

export const unsubscriptionFuns = {}

export function initModelsSubscriptions() {
  models.reduce((t, m) => {
    if (isObject(m.subscriptions)) {
      const defaultArgs = {
        dispatch: (action) => put(m.namespace, action),
        history,
        select
      }
      Object.keys(m.subscriptions).forEach(subs => {
        if (!isObject(t[m.namespace])) {
          t[m.namespace] = {}
        }
        t[m.namespace][subs] = m.subscriptions[subs](defaultArgs)
      })
    }
    return t
  }, unsubscriptionFuns)
}

export function unsubscribe(path) {
  const [namespace, subscription] = path.split('/')
  const unsubsFuns = unsubscriptionFuns[namespace][subscription]
  if (isFunction(unsubsFuns)) {
    unsubsFuns()
  } else if (isArray(unsubsFuns) && unsubsFuns.length > 0) {
    unsubsFuns.forEach(unsubs => unsubs())
  } else {
    console.error(`${namespace}.subscriptions.${subscription} should return a function or function array!`)
  }
}

export function subscribe(path) {
  const [namespace, subscription] = path.split('/')
  const model = select(namespace)
  if (isObject(model.subscriptions)) {
    const defaultArgs = {
      dispatch: (action) => put(model.namespace, action),
      history,
      select
    }

    if (!isObject(unsubscriptionFuns[model.namespace])) {
      unsubscriptionFuns[model.namespace] = {}
    }
    unsubscriptionFuns[model.namespace][subscription] = model.subscriptions[subscription](defaultArgs)
  }
}

export function updateState(model, state) {
  model.state = state
  modelsState[model.namespace] = state
}

export function updateStateGroup(groups, groupName, state) {
  groups[groupName] = state
}

export function selectGroup(context) {
  if (!context[prefix]._isComponent) {
    return clone(context[prefix]._groups || {})
  }
  const groupName = context.data.groupName
  const groupKeys = isObject(context.data.groupKeys) ? Object.keys(context.data.groupKeys) : []
  const group = context[prefix]._page[prefix]._groups[groupName]
  groupKeys.forEach((key, value) => {
    group[value] = group[key]
  })
  return clone(group || {})
}

export function setModels(m) {
  models = m
  initModelsState(models, modelsState)
}


export function initModelsState(models, modelsState) {
  for (let i = 0;i < models.length; i++) {
    modelsState[models[i].namespace] = models[i].state
  }
}

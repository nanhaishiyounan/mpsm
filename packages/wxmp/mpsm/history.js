import {currPage, clone} from "./util"

export const prevRoute = {
  route: '',
  options: {}
}
export const funs = []

export const history = {
  listen(callback) {
    if (funs.indexOf(callback) === -1) {
      funs.push(callback)
    }
  },
  unlisten(callback) {
    funs.splice(funs.indexOf(callback), 1)
  }
}

export function notifyHistoryListen() {
  const {route, options} = currPage()
  if (route === prevRoute.route && options === prevRoute.options) {
    return
  }
  const current = clone({route, options})
  const prev = clone(prevRoute)

  funs.forEach(f => f(current, prev))

  prevRoute.route = route
  prevRoute.options = options
}
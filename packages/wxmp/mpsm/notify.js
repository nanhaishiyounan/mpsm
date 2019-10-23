import {currPage, getPages, prefix} from "./util"
import {performTransaction} from "./transaction"


export default function notify(lazy) {
  const pages = getPages()
  const currPageIns = currPage()

  pages.forEach(pageIns => {
    pageIns[prefix]._hasTransaction = true
    if (currPageIns === pageIns || !lazy) {
      performTransaction(pageIns)
    }
  })
}

export function notifyGroup(pageIns, groupName) {
  pageIns[prefix]._groupNamesNeedUpdate.push(groupName)
  if (pageIns !== currPage()) {
    return
  }
  performTransaction(pageIns, pageIns[prefix]._groupNamesNeedUpdate)
}
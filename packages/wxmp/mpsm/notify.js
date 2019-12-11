import {currPage, getPages, prefix} from "./util"
import {performTransaction} from "./transaction"


export default function notify(namespace, lazy, batch) {
  const pages = getPages()
  const currPageIns = currPage()

  pages.forEach(pageIns => {
    pageIns[prefix]._hasTransaction = true
    if (currPageIns === pageIns || !lazy) {
      performTransaction(namespace, pageIns, null, batch)
    }
  })
}

export function notifyGroup(pageIns, groupName, batch) {
  pageIns[prefix]._groupNamesNeedUpdate.push(groupName)
  if (pageIns !== currPage()) {
    return
  }
  performTransaction('', pageIns, pageIns[prefix]._groupNamesNeedUpdate, batch)
}
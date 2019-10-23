

export default {
  data: {
    env: wx.getSystemInfoSync().platform
  },
  onLoad() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const pageType = currentPage.route || ''
    console.log(pageType)
  },
}
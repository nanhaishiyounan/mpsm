import {page} from './mpsm/index'
import models from './models/index'
import pageOptions from './utils/pageOptions'
import componentOptions from './utils/componentOptions'


App({
  onLaunch: function () {
    page.init(models, pageOptions, componentOptions)
  },
})
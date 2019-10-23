export function formatDuration(time = 0) {
  let seconds = parseInt(time % 60) >= 10 ? parseInt(time % 60) : '0' + parseInt(time % 60);
  let minutes = parseInt(time / 60 % 60) >= 10 ? parseInt(time / 60 % 60) : '0' + parseInt(time / 60 % 60);
  let hours = parseInt(time / 3600 % 24);
  if (hours != 0) {
    return (hours + ':' + minutes + ':' + seconds);
  } else {
    return (minutes + ':' + seconds);
  }
}

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function jumpTo(options) {
  let url = options.url || "";

  let to = (url.match(/.+\/(\w+)/i) || ['index', 'index'])[1];
  let pages = getCurrentPages();
  let i = 0;
  while (pages[i] && pages[i].type !== to) {
    i++;
  }
  //已有页面在栈里，返回
  if (i < pages.length - 2) {
    let delta = pages.length - 1 - i;
    wx.navigateBack({
      delta: delta
    });
    return;
  }
  //是当前页，刷新当前页
  if (i === pages.length - 1) {
    wx.redirectTo({
      url: url
    });
    return;
  }
  if (pages.length >= 10) {
    wx.redirectTo({
      url: url
    });
    return;
  }
  wx.navigateTo({
    url: url
  });
}

// 生成随机字符串，默认32位
export function generateRandom(n = 32) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let res = ''
  for (let i = 0; i < n; i += 1) {
    const id = Math.ceil(Math.random() * 35)
    res += chars[id]
  }
  return res
}



export function debounce(func, wait = 500) {
  let timeout;
  let result;
  return function() {
    const context = this;
    const args = arguments;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function() {
      result = func.apply(context, args)
    }, wait);
    return result;
  };
}

export function generateUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}


export function isObject(v) {
  return typeof v === 'object' && v
}

export function isString(v) {
  return typeof v === 'string'
}

export function isUndefined(v) {
  return typeof v === 'undefined'
}

export function isNull(v) {
  return typeof v === 'object' && !v
}

export function isNumber(v) {
  return typeof v === 'number'
}

export function isBoolean(v) {
  return typeof v === 'boolean'
}

export function getDeviceId() {
  //设置设备diviceId
  let diviceId = wx.getStorageSync('DEVICE_ID')
  if (!diviceId) {
    diviceId = generateUUID()
    wx.setStorageSync('DEVICE_ID', diviceId)
  }
  return diviceId
}

export function throttle(fn,delay = 1000){
  let last = 0;
  return function(){
    let curr = +new Date();
    if(curr - last > delay){
      fn.apply(this,arguments);
      last = curr;
    }
  }
}

export function compareVersion(v) {
  let v1 = wx.getSystemInfoSync().SDKVersion
  v1 = v1.split('.')
  v = v.split('.')
  const len = Math.max(v1.length, v.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v.length < len) {
    v.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }

  return true
}

export default {
  formatDuration,
  formatTime,
  jumpTo,
  generateRandom,
  debounce,
  generateUUID,
  isObject,
  isString,
  isUndefined,
  isNull,
  isNumber,
  isBoolean,
  getDeviceId,
  throttle,
  compareVersion
}

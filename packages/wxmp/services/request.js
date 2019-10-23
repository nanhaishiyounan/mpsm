import {TOKEN_ID} from '../constants/index';

export const request = (method = 'GET') => (url, data = {}, header = {}) => {
  const {token = 0, uid = 0} = wx.getStorageSync('USER_INFO') || {}
  if (token && uid) {
    header.cookie = `${TOKEN_ID}&_token=${uid}&${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      header,
      success: function(res) {
        resolve(res.data)
      },
      fail: function(err) {
        reject(err)
      },
    });
  })
}

export const get = request('GET');
export const post = request('POST');
export const put = request('PUT');
export const del = request('DELETE');

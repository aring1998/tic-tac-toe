import { Popup } from './popup.js'

// 创建axios实例
const instance = axios.create({
  // baseURL: 'http://localhost:3700/api/', // 测试环境
  baseURL: 'http://81.68.189.158:3700/api/', // 正式环境
  timeout: 30000,
  validateStatus: status => {
    // 允许返回所有状态码，不会遇到错误就停止
    return status >= 200 && status <= 600
  }
})

// 请求拦截
instance.interceptors.request.use(config => {
  return config
}), err => {
  console.log(err)
}
// 响应拦截
instance.interceptors.response.use(res => {
  const $pop = new Popup()
  if (res.status !== 200) $pop.message.common('网络请求错误')
  if (res.data.code !== 0) $pop.message.common(res.data.message)
  return res.data  // 配置只返回data
}), err => {
  console.log(err)
}

// 封装get/post方法
export const api = {
  async get(url, params) {
    try {
      let res = await instance.get(url, {params})
      return new Promise(resolve => {
        resolve(res)
      })
    } catch (err) {
      console.log(err)
    }
  },
  async post(url, data) {
    try {
      let res = await instance.post(url, data)
      return new Promise(resolve => {
        resolve(res)
      })
    } catch (err) {
      console.log(err)
    }
  }
}

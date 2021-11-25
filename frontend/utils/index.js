/**
 * 双向绑定元素
 *
 * @param {Object} object 绑定对象
 * @param {String} prop 属性
 * @param {DOM} el 绑定的元素
 */
export const bind = (object, prop, el) => {
  Object.defineProperty(object, prop, {
    set(val) {
      el.innerText = val
      prop = val
    },
    get() {
      return prop
    }
  })
}

/**
 * 获取URL中的参数
 * 
 * @param {String} name 获取参数的名称
 */
export const getParameter = name => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') // 构建一个含有目标参数的正则表达式对象
  const r = window.location.search.substr(1).match(reg) // 匹配目标参数
  if (r != null) {
    //清理参数中为null的值
    if (unescape(r[2]) == 'null') return ''
    return unescape(r[2])
  } else return ''
}

/**
 * 一键复制
 * 
 * @param {String} text 复制的文本 
 * @returns 
 */
export const copyer = text => {
  if (!text) return
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.style = 'position: absolute; opacity: 0; top: 0; left: 0'
  input.focus()
  input.select()
  document.execCommand('copy')
  input.remove()
}
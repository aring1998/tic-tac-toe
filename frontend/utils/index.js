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
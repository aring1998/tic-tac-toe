export class Popup {
  wrap = document.getElementsByClassName('tic-tac-toe')[0]
  // 消息框
  message = {
    wrap: this.wrap,
    common(content, closeTime = 3000) {
      const message = document.createElement('div')
      message.classList.add('message')
      message.setAttribute('id', 'commonTips')
      message.innerHTML = `<span>${content}</span>`
      this.wrap.appendChild(message)
      setTimeout(() => {
        message.classList.add('fade-out')
        setTimeout(() => {
          message.remove()
        }, 1000)
      }, closeTime)
    }
  }
  // 等待提示框
  loading = {
    wrap: this.wrap,
    open(content, onCancel) {
      const popShade = document.createElement('div')
      popShade.classList.add('popup-shade')
      popShade.setAttribute('id', 'loading')
      const pop = document.createElement('div')
      pop.classList.add('popup', 'loading')
      pop.innerHTML = `${content || '请等待...'}`
      if (onCancel) {
        const closeBtn = document.createElement('div')
        closeBtn.classList.add('close-btn')
        closeBtn.innerHTML = '×'
        closeBtn.addEventListener('click', () => {
          onCancel()
          popShade.remove()
        })
        pop.appendChild(closeBtn)
      }
      popShade.appendChild(pop)
      this.wrap.appendChild(popShade)
    },
    close() {
      document.getElementById('loading')?.remove()
    }
  }
  // 警告框
  alert(content, next, btnName) {
    const popShade = document.createElement('div')
    popShade.classList.add('popup-shade', 'transparent')
    popShade.setAttribute('id', 'alert')
    const pop = document.createElement('div')
    pop.classList.add('popup', 'alert')
    pop.innerHTML = `
      <span>${content || '请等待...'}</span>
    `
    const btn = document.createElement('button')
    btn.classList.add('common-btn')
    btn.innerHTML = btnName || '好的'
    popShade.appendChild(pop)
    pop.appendChild(btn)
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      if (next) await next()
      popShade.remove()
    })
    this.wrap.appendChild(popShade)
  }
  // 确认框
  confirm(title, content, next) {
    const popShade = document.createElement('div')
    popShade.classList.add('popup-shade')
    popShade.setAttribute('id', 'confirm')
    const pop = document.createElement('div')
    pop.classList.add('popup', 'confirm')
    pop.innerHTML = `
      <h4>${title}</h4>
      <span>${content}</span>
      <input id="confirmInput" type="number" />
      <div class="btn-wrap">
        <button id="confirmCancel">取消</button>
        <button id="confirmNext">确定</button>
      </div>
    `
    popShade.appendChild(pop)
    this.wrap.appendChild(popShade)
    document.getElementById('confirmInput').focus()
    document.getElementById('confirmCancel').addEventListener('click', e => {
      e.stopPropagation()
      document.getElementById('confirm').remove()
    })
    document.getElementById('confirmNext').addEventListener('click', async e => {
      e.stopPropagation()
      const value = document.getElementById('confirmInput').value
      const flag = await next(value)
      if (flag) document.getElementById('confirm').remove()
    })
  }
}
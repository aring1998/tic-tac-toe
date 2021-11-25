import { bind, getParameter, copyer } from './utils/index.js'
import { api } from './utils/api.js'
import { Popup } from './utils/popup.js'
class TicTacToe {
  enter = document.getElementsByClassName('enter')[0]
  roomInfo = {}
  // 玩家类型，0: 创建者；1: 加入者
  playerType = 0
  player = 'O'
  gameData = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  cells = []
  // ws = new WebSocket('ws://localhost:3700/ws') // 本地环境
  ws = new WebSocket('ws://81.68.189.158:3700/ws') // 正式环境
  // 胜利条件
  winCombo = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  $api = api
  $pop = new Popup()
  key = UUID.generate()
  gameState = ''
  time = 10
  timer
  constructor() {
    this.init()
    // 双向绑定
    bind(this, 'player', document.getElementsByClassName('player')[0])
    bind(this, 'gameState', document.getElementsByClassName('game-state')[0])
    bind(this, 'time', document.getElementById('time'))
    // 判断url是否带房间号参数
    if (getParameter('roomId')) this.joinRoom(getParameter('roomId'))
  }
  init() {
    this.$pop.loading.open('加载中···<br>长时间未响应请尝试刷新页面')
    const wrap = document.getElementsByClassName('game-wrap')[0]
    wrap.onclick = (e) => this.click(e)
    // 渲染方块格
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      cell.dataset.num = i
      wrap.appendChild(cell)
    }
    this.cells = document.getElementsByClassName('cell')
    // 绑定按钮点击事件
    document.getElementById('create').onclick = () => this.createRoom()
    document.getElementById('join').onclick = () => this.$pop.confirm('加入房间', '请输入房间号', value => this.joinRoom(value))
    // 连接初始ws
    this.ws.onopen = () => {
      this.$pop.loading.close()
      this.ws.send(JSON.stringify({ key: this.key, type: 'init' }))
    }
    this.ws.onclose = () => {
      this.$pop.alert('连接已断开', () => location.reload())
    }
  }
  // 创建房间
  async createRoom() {
    const res = await this.$api.post('games/createRoom')
    if (res.code === 0) {
      this.roomInfo = res.data
      this.enter.classList.add('hide')
      this.$pop.loading.open(`
        请等待其他玩家加入...<br>您的房间号：${this.roomInfo.roomId}<br>
        <button class="common-btn" id="share">复制分享链接</button>
      `)
      document.getElementById('share').onclick = () => {
        copyer(`${location.href}?roomId=${this.roomInfo.roomId}`)
        this.$pop.message.common('您已复制房间链接，快去分享给好友吧~')
      }
      this.ws.onmessage = e => {
        const data = JSON.parse(e.data)
        this.roomInfo = data
        this.battle()
        this.choiceFirst(data)
        this.$pop.loading.close()
      }
      this.ws.send(JSON.stringify({ key: this.key, roomId: res.data.roomId, type: 'create' }))
    }
  }
  // 加入房间
  async joinRoom(roomId) {
    if (roomId.length !== 4) return this.$pop.message.common('房间号为四位数')
    const res = await this.$api.post('games/joinRoom', {
      roomId
    })
    if (res.code === 0) {
      this.enter.classList.add('hide')
      const roomId = res.data.roomId
      this.ws.onmessage = e => {
        const data = JSON.parse(e.data)
        this.roomInfo = data
        // 加入者修改playerType
        this.playerType = 1
        this.battle()
        this.choiceFirst(data)
      }
      this.ws.send(JSON.stringify({ key: this.key, roomId, type: 'join' }))
      return true
    }
  }
  // 开始战斗
  async battle() {
    this.ws.onmessage = e => {
      const data = JSON.parse(e.data)
      if (data.code === -1) return this.$pop.alert('对方已逃跑', () => this.resetGame())
      // 对战结束时，清空定时器
      if (data.code === -2) return this.timerReset()
      this.roomInfo = data
      this.gameData = this.roomInfo.gameData
      if (this.roomInfo.player === this.playerType) {
        this.gameState = '请下棋'
        this.timerBegin()
      }
      else this.gameState = '请等待其他玩家下棋'
      this.render()
      this.result()
    }
  }
  // 点击方块格
  click(e) {
    if (this.roomInfo.player !== this.playerType) return this.$pop.message.common('请等待对手下棋')
    let num
    // 如果超时时调用
    if (!e) {
      for (let i in this.gameData) {
        if (this.gameData[i] === 0) {
          num = Number(i)
          break
        }
      }
    } else {
      // 获取点击元素的dataset
      num = e.target.dataset.num
    }

    if (this.cells[num].innerText) return
    this.gameData[num] = this.player === 'O' ? 1 : 2
    this.timerReset()

    this.ws.send(JSON.stringify({
      key: this.key,
      roomId: this.roomInfo.roomId,
      gameData: this.gameData,
      player: this.playerType,
      type: 'battle'
    }))
  }
  // 根据gameData渲染
  render() {
    for (let i in this.gameData) {
      if (!this.gameData[i]) continue
      this.cells[i].innerText = this.gameData[i] === 1 ? 'O' : 'X'
    }
  }
  // 判断结果
  result() {
    for (let i of this.winCombo) {
      // 获取胜利条件对应位置的文本
      const first = this.cells[i[0]].innerText
      const second = this.cells[i[1]].innerText
      const third = this.cells[i[2]].innerText
      if (!first || !second || !third) continue
      // 比对三个位置的文本，若全相等则判定胜利
      if (first === second && second === third) {
        return setTimeout(() => {
          this.$pop.alert(this.roomInfo.player === this.playerType ? '对方赢了' : '您赢了', () => this.resetGame())
        }, 300);
      }
    }
    let step = 0
    for (let i of this.gameData) {
      if (i === 0) break
      if (i !== 0) step++
      if (step === 9) {
        return setTimeout(() => {
          this.$pop.alert('平局', () => this.resetGame())
        }, 300);
      }
    }
  }
  // 判定谁先手
  choiceFirst(data) {
    if (data.first === this.playerType) {
      this.player = 'O'
      this.gameState = '请下棋'
      this.timerBegin()
    } else {
      this.player = 'X'
      this.gameState = '请等待其他玩家下棋'
    }
  }
  // 重置游戏
  resetGame() {
    this.timerReset()
    this.enter.classList.remove('hide')
    this.gameData = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let i of this.cells) {
      i.innerText = ''
    }
    this.ws.send(JSON.stringify({ roomId: this.roomInfo.roomId, type: 'end' }))
  }
  // 计时器运作
  timerBegin() {
    this.timerReset()
    this.timer = setInterval(() => {
      this.time = `${Number(this.time) - 1}`
      if (Number(this.time) < 0) this.click()
    }, 1000);
  }
  timerReset() {
    this.time = 10
    clearInterval(this.timer)
  }
}

const gameMain = new TicTacToe()
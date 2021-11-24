import { bind } from './utils/index.js'
import { api } from './utils/api.js'
import { Popup } from './utils/popup.js'
class TicTacToe {
  roomInfo = {}
  playerType = 0
  player = 'O'
  gameData = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  cells = []
  // ws = new WebSocket('ws://localhost:3700/ws')
  ws = new WebSocket('ws://81.68.189.158:3700/ws')
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
  constructor() {
    this.init()
    this.cells = document.getElementsByClassName('cell')
    // 双向绑定
    bind(this, 'player', document.getElementsByClassName('player')[0])
    bind(this, 'gameState', document.getElementsByClassName('game-state')[0])
  }
  async init() {
    const wrap = document.getElementsByClassName('game-wrap')[0]
    wrap.onclick = (e) => this.click(e)
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      cell.dataset.num = i
      wrap.appendChild(cell)
    }
    document.getElementById('create').onclick = () => this.createRoom()
    document.getElementById('join').onclick = () => this.joinRoom()
    this.ws.onopen = e => {
      this.ws.send(JSON.stringify({ key: this.key, type: 'init' }))
    }
  }
  click(e) {
    if (this.roomInfo.player !== this.playerType) return this.$pop.message.common('请等待对手下棋')
    const num = e.target.dataset.num
    if (this.cells[num].innerText) return
    this.gameData[num] = this.player === 'O' ? 1 : 2
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
      const first = this.cells[i[0]].innerText
      const second = this.cells[i[1]].innerText
      const third = this.cells[i[2]].innerText
      if (!first || !second || !third) continue
      if (first === second && second === third) {
        alert(this.roomInfo.player === this.playerType ? '对方赢了' : '您赢了')
        break
      }
    }
  }
  // 创建房间
  async createRoom() {
    const res = await this.$api.post('games/createRoom')
    if (res.code === 0) {
      this.roomInfo = res.data
      document.getElementsByClassName('enter')[0].classList.add('hide')
      this.$pop.loading.open(`请等待其他玩家加入...<br>您的房间号：${this.roomInfo.roomId}`)
      this.ws.onmessage = e => {
        this.$pop.loading.close()
        const data = JSON.parse(e.data)
        this.roomInfo = data
        this.battle()
        this.choiceFirst(data)

      }
      this.ws.send(JSON.stringify({ key: this.key, roomId: res.data.roomId, type: 'create' }))
    }
  }
  // 加入房间
  async joinRoom() {
    this.$pop.confirm('加入房间', '请输入房间号', async value => {
      if (value.length !== 4) return this.$pop.message.common('房间号为四位数')
      const res = await this.$api.post('games/joinRoom', {
        roomId: value
      })
      if (res.code === 0) {
        document.getElementsByClassName('enter')[0].classList.add('hide')
        const roomId = res.data.roomId
        this.ws.onmessage = e => {
          const data = JSON.parse(e.data)
          this.roomInfo = data
          this.playerType = 1
          this.battle()
          this.choiceFirst(data)
        }
        this.ws.send(JSON.stringify({ key: this.key, roomId, type: 'join' }))
        return true
      }
    })
  }
  async battle() {
    this.ws.onmessage = e => {
      this.roomInfo = JSON.parse(e.data)
      this.gameData = this.roomInfo.gameData
      if (this.roomInfo.player === this.playerType) this.gameState = '请下棋'
      else this.gameState = '请等待其他玩家下棋'
      this.render()
      this.result()
    }
  }
  choiceFirst(data) {
    if (data.first === this.playerType) {
      this.player = 'O'
      this.gameState = '请下棋'
    } else {
      this.player = 'X'
      this.gameState = '请等待其他玩家下棋'
    }
  }
}

const gameMain = new TicTacToe()
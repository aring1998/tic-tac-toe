const games = require('../controller/games')
const clients = []

const webSocket  = async (ws, req) => {
  let roomId = ''
  let key = ''

  ws.on('message', async val => {
    const { type } = JSON.parse(val)
    roomId = JSON.parse(val).roomId
    key = JSON.parse(val).key
    // 给当前客户端绑定房间号
    for (let i of clients) {
      if (i.key === key) i.roomId = roomId
    }

    switch (type) {
      // 打开客户端时调用初始化
      case 'init': {
        // 记录登录的客户端
        clients.push({
          key,
          ws,
          created: Date.now()
        })
        break
      }
      // 创建游戏
      case 'create': return
      // 加入游戏
      case 'join': {
        const data = await games.battleBegin(roomId)
        // 给对应房间的客户端返回消息
        clients.map(item => {
          if (item.roomId === roomId) item.ws.send(JSON.stringify(data))
        })
        break
      }
      // 对战双方点击时
      case 'battle': {
        const { roomId } = JSON.parse(val)

        const data = await games.updateGameData(JSON.parse(val))
        for (let i of clients) {
          if (i.roomId === roomId) i.ws.send(JSON.stringify(data))
        }
        break
      }
    }
  })

  ws.on('close', async () => {
    for (let i in clients) {
      if (clients[i].key === key) clients.splice(i, 1)
    }
  })
}

module.exports = webSocket
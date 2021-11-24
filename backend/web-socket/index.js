const games = require('../controller/games')
const clients = []

const webSocket  = async (ws, req) => {
  let roomId = ''
  let key = ''

  ws.on('message', async val => {
    const { type } = JSON.parse(val)
    roomId = JSON.parse(val).roomId
    key = JSON.parse(val).key
    for (let i of clients) {
      if (i.key === key) i.roomId = roomId
    }

    switch (type) {
      case 'init': {
        clients.push({
          key,
          ws,
          created: Date.now()
        })
        break
      }
      case 'create': return
      case 'join': {
        const data = await games.battleBegin(roomId)
        clients.map(item => {
          if (item.roomId === roomId) item.ws.send(JSON.stringify(data))
        })
        break
      }
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
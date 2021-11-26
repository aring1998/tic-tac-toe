const gamesModal = require('../models/games')
const { suc, fail } = require('../utils/render')

/**
 * 创建房间
 */
const createRoom = async (req, res, next) => {
  let roomId = ''
  for (let i = 0; i < 4; i++) {
    if (i === 0) roomId += Math.floor(Math.random() * 9 + 1)
    else roomId += Math.floor(Math.random() * 10)
  }
  const room = await gamesModal.findGame({ roomId })
  if (room) return createRoom()
  const data = await gamesModal.addGame({
    roomId,
    state: 1
  })
  suc(res, data, '创建房间成功')
}

/**
 * 加入房间
 */
const joinRoom = async (req, res, next) => {
  const { roomId } = req.body
  if (!roomId) return fail(res, '房间号必填')
  const data = await gamesModal.findGame({ roomId })
  if (!data) return fail(res, '找不到对应的房间')
  if (data.state === 2) return fail(res, '房间已满人')
  suc(res, data, '加入房间成功')
}

/**
 * 建立房间链接
 */
const battleBegin = async val => {
  const roomId = val
  const first = Math.random() > 0.5 ? 0 : 1
  await gamesModal.updateGame({ roomId }, { state: 2, first, player: first })
  const data = await gamesModal.findGame({ roomId })
  return data
}

/**
 * 修改游戏并返回数据
 */
const updateGameData = async (val) => {
  const { roomId, gameData, player } = val
  if (!roomId || !gameData) return
  await gamesModal.updateGame({ roomId }, {
    gameData,
    player: player ? 0 : 1
  })
  const data = await gamesModal.findGame({ roomId })
  return data
}

/**
 * 删除房间
 */
const delRoom = async val => {
  if (!val) return
  await gamesModal.deleteGame({ ...val })
}

module.exports = {
  createRoom,
  joinRoom,
  battleBegin,
  updateGameData,
  delRoom
}
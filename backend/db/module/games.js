const mongoose = require('mongoose')

// 构建games的model
const gamesSchema = mongoose.Schema({
  roomId: String,
  gameData: {
    type: Array,
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  // 状态， 0: 未开启；1: 一人就位；2: 两人就位
  state: {
    type: Number,
    default: 0
  },
  // 当前玩家，0: 创建者；1: 加入者
  player: {
    type: Number,
    default: 0
  },
  // 先手者，0: 创建者；1: 加入者
  first: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 0
  },
  // 是否胜利，0: 平局；1: 创建者胜利；2: 加入者胜利
  success: {
    type: Number,
    default: 0
  },
  created: Number,
})

const games = mongoose.model('games', gamesSchema)
module.exports = games
const mongoose = require('mongoose')
// mongoose.connect('mongodb://localhost/tic-tac-toe', {  // 本地环境
mongoose.connect('mongodb://81.68.189.158:26918/tic-tac-toe', {  // 正式环境
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

const Users = require('./module/users')
const Games = require('./module/games')

module.exports = {
  Users,
  Games
}
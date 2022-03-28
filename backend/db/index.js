const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

// mongoose.connect('mongodb://localhost/tic-tac-toe', {  // 本地环境
mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

const Games = require('./module/games')

module.exports = {
  Games
}
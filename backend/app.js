const createError = require('http-errors')
const express = require('express')
const expressWs = require('express-ws')
const webSocket = require('./web-socket/index')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const gamesRouter = require('./routes/games')

const appBase = express()
// websocket
const wsInstance = expressWs(appBase)
const {app} = wsInstance

app.ws('/ws', (ws, req) => {
  webSocket(ws, req)
})

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api/games', gamesRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('fail')
})


module.exports = app

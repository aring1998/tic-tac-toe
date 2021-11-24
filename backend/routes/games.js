const express = require('express')
const router = express.Router()

const { createRoom, joinRoom } = require('../controller/games')

router.post('/createRoom', createRoom)
router.post('/joinRoom', joinRoom)

module.exports = router

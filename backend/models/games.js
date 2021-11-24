const { Games } = require('../db/index')

const findGame = async data => {
  const res = await Games.findOne({ ...data })
  return res?._doc
}

const addGame = data => {
  const game = new Games({
    ...data,
    created: Date.now()
  })
  return game.save()
}

const updateGame = async (query, value) => {
  return new Promise(resolve => {
    Games.updateOne(query, value, (err, res) => {
      if (!err) {
        resolve(res)
      }
    })
  }).then(res => res)
}

const deleteGame = data => {
  return Games.deleteOne({ ...data })
}

module.exports = {
  findGame,
  addGame,
  updateGame,
  deleteGame
}
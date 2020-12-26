if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

console.log('Server running at localhost:3000')
const express = require('express')
const app = express()
const server = app.listen(3000)
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const Datastore = require('nedb')
const methodOverride = require('method-override')

const db = new Datastore({ filename: 'database.db', autoload: true })

const initializePassport = require('./passport-config')

initializePassport(passport)

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.engine('html', require('ejs').renderFile)

app.get('/', checkAuthenticated, (req, res) => {
  res.render('account.ejs', {
    name: req.user.name,
    username: req.user.username,
    gamesPlayed: req.user.gamesPlayed,
    wins: req.user.wins,
    losses: req.user.losses,
    draw: req.user.draw
  })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.get('/play', checkAuthenticated, (req, res) => {
  res.render('../public/game.ejs', {
    name: req.user.name,
    username: req.user.username,
    gamesPlayed: req.user.gamesPlayed,
    wins: req.user.wins,
    losses: req.user.losses,
    draw: req.user.draw,
    room: req.body.room
  })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.password, 10)
    db.insert({
      name: req.body.name,
      username: req.body.username,
      password: hashedPwd,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draw: 0
    })
    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }
})

app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}
function checkNotAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

const socket = require('socket.io')
const io = socket(server)

io.sockets.on('connection', socket => {
  io.to(socket.id).emit('connectToRoom')

  socket.on('move', data => {
    io.to(data.opponent).emit('move', data)
  })

  socket.on('join', room => {
    if (io.sockets.adapter.rooms['room-' + room] != undefined) {
      let players = io.sockets.adapter.rooms['room-' + room].sockets
      let numPlayers =
        typeof players !== 'undefined' ? Object.keys(players).length : 0
      if (numPlayers < 2) {
        socket.join('room-' + room)
        let playerIds = []
        for (let playerId in players) {
          playerIds.push(playerId)
        }
        shuffle(playerIds)
        for (let playerId in players) {
          io.to(playerId).emit('startGame', playerIds)
        }
      } else {
        io.to(socket.id).emit('roomFull')
      }
    } else {
      socket.join('room-' + room)
    }
  })

  socket.on('win', id => {
    io.to(id).emit('gameOver', 1)
  })

  socket.on('loss', id => {
    io.to(id).emit('gameOver', 0)
  })

  socket.on('registerWin', username => {
    db.loadDatabase()
    db.findOne({ username: username }, (err, user) => {
      user.gamesPlayed += 1
      user.wins += 1
      db.update({ username: username }, user, {}, () => {})
    })
  })

  socket.on('registerLoss', username => {
    db.loadDatabase()
    db.findOne({ username: username }, (err, user) => {
      user.gamesPlayed += 1
      user.losses += 1
      db.update({ username: username }, user, {}, () => {})
    })
  })

  socket.on('getNameFrom', id => {
    io.to(id).emit('nameRequest')
  })

  socket.on('sendNameToOpponent', data => {
    io.to(data.opponent).emit('oppName', data.username)
  })
})

function shuffle (array) {
  array.sort(() => Math.random() - 0.5)
}

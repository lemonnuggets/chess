// pieceType:
//     'k' = KING   = 0
//     'q' = QUEEN  = 1
//     'b' = BISHOP = 2
//     'kn'= KNIGHT = 3
//     'r' = ROOK   = 4
//     'p' = PAWN   = 5

// userType:
//     'w' = WHITE = 0
//     'b' = BLACK = 1

// TODO: if king is under attack, move is invalid

let bg
let uPieces = []
let oPieces = []
let sOffset = 4
let watchedCells = []
let userC = 1
let check = 0
let socket
let wait = userC
let room
let state = 1
let opponent
let endStatus
let username

class Piece {
  constructor (x, y, userType, pieceType) {
    this.pieceType = pieceType
    this.userType = userType
    this.x = x
    this.y = y
    this.selected = false
    this.sprite = sprites.get(
      (pieceType * sprites.width) / 6,
      (userType * sprites.height) / 2,
      sprites.width / 6,
      sprites.height / 2
    )
    this.sprite.resize(cellEdge, 0)
  }

  show () {
    push()
    imageMode(CENTER)
    image(
      this.sprite,
      this.x * cellEdge + cellEdge / 2 + 1,
      this.y * cellEdge + cellEdge / 2 - 1
    )
    if (check == 1 && this.pieceType == 0 && this.userType == userC) {
      fill(255, 0, 125, 150)
      stroke(225, 125, 0)
      strokeWeight(4)
      rect(this.x * cellEdge, this.y * cellEdge, cellEdge, cellEdge, 20)
    }
    if (this.selected == true) {
      noFill()
      stroke(0, 125, 225)
      strokeWeight(4)
      rect(this.x * cellEdge, this.y * cellEdge, cellEdge, cellEdge, 20)
      let cells = this.validMoves()
      cells.forEach(cell => {
        fill(225 * cell[2], 225 * (1 - cell[2]), 125, 150)
        stroke(225 * cell[2], 225 * (1 - cell[2]), 125, 150)
        strokeWeight(4)
        rect(cell[0] * cellEdge, cell[1] * cellEdge, cellEdge, cellEdge, 20)
      })
      watchedCells = cells
    }
    pop()
  }

  validMoves (mode = 0) {
    let cells = []
    if (this.pieceType == 5) {
      //PAWN
      let y = this.y - 1
      if (indexOfuPieceAt(this.x, y) < 0) {
        if (indexOfoPieceAt(this.x, y) < 0) {
          if (y - 1 >= 0) {
            cells.push([this.x, y, 0])
          }
        }
      }
      if (indexOfuPieceAt(this.x - 1, y) < 0) {
        if (indexOfoPieceAt(this.x - 1, y) >= 0) {
          cells.push([this.x - 1, y, 1])
        }
      }
      if (indexOfuPieceAt(this.x + 1, y) < 0) {
        if (indexOfoPieceAt(this.x + 1, y) >= 0) {
          cells.push([this.x + 1, y, 1])
        }
      }
    } else if (this.pieceType == 4) {
      //ROOK
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y
        if (x > 7 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y
        if (x < 0 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y - i
        if (y < 0 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y + i
        if (y > 7 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
    } else if (this.pieceType == 3) {
      //KNIGHT
      for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
          if (i == 0) {
            i++
          }
          if (j == 0) {
            j++
          }
          if (i != j && i != -j) {
            let x = this.x + i
            let y = this.y + j
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
              if (indexOfoPieceAt(x, y) >= 0) {
                cells.push([x, y, 1])
              } else if (indexOfuPieceAt(x, y) < 0) {
                cells.push([x, y, 0])
              }
            }
          }
        }
      }
    } else if (this.pieceType == 2) {
      //BISHOP
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y + i
        if (x >= 8 || y >= 8) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y + i
        if (x < 0 || y >= 8) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y - i
        if (x >= 8 || y < 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y - i
        if (x < 0 || y < 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
    } else if (this.pieceType == 1) {
      //QUEEN
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y + i
        if (x >= 8 || y >= 8) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y + i
        if (x < 0 || y >= 8) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y - i
        if (x >= 8 || y < 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y - i
        if (x < 0 || y < 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          break
        } else if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y
        if (x > 7 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y
        if (x < 0 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y - i
        if (y < 0 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y + i
        if (y > 7 || indexOfuPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
    } else if (this.pieceType == 0) {
      //KING
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (!(i == 0 && j == 0)) {
            let x = this.x + i
            let y = this.y + j
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
              if (indexOfuPieceAt(x, y) < 0) {
                if (indexOfoPieceAt(x, y) >= 0) {
                  cells.push([x, y, 1])
                } else {
                  cells.push([x, y, 0])
                }
              }
            }
          }
        }
      }
    }
    if (mode == 0) {
      for (let i = cells.length - 1; i >= 0; i--) {
        let move = cells[i]
        if (willPutKingInDanger(this.x, this.y, move[0], move[1])) {
          cells.splice(i, 1)
        }
      }
    }
    return cells
  }

  oppValidMoves () {
    let cells = []
    if (this.pieceType == 5) {
      //PAWN
      let y = this.y + 1
      if (indexOfoPieceAt(this.x, y) < 0) {
        if (indexOfuPieceAt(this.x, y) < 0) {
          if (y < 8) {
            cells.push([this.x, y, 0])
          }
        }
      }
      if (indexOfoPieceAt(this.x - 1, y) < 0) {
        if (indexOfuPieceAt(this.x - 1, y) >= 0) {
          cells.push([this.x - 1, y, 1])
        }
      }
      if (indexOfoPieceAt(this.x + 1, y) < 0) {
        if (indexOfuPieceAt(this.x + 1, y) >= 0) {
          cells.push([this.x + 1, y, 1])
        }
      }
    } else if (this.pieceType == 4) {
      //ROOK
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y
        if (x > 7 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y
        if (x < 0 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y - i
        if (y < 0 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y + i
        if (y > 7 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
    } else if (this.pieceType == 3) {
      //KNIGHT
      for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
          if (i == 0) {
            i++
          }
          if (j == 0) {
            j++
          }
          if (i != j && i != -j) {
            let x = this.x + i
            let y = this.y + j
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
              if (indexOfuPieceAt(x, y) >= 0) {
                cells.push([x, y, 1])
              } else if (indexOfoPieceAt(x, y) < 0) {
                cells.push([x, y, 0])
              }
            }
          }
        }
      }
    } else if (this.pieceType == 2) {
      //BISHOP
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y + i
        if (x >= 8 || y >= 8) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y + i
        if (x < 0 || y >= 8) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y - i
        if (x >= 8 || y < 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y - i
        if (x < 0 || y < 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
    } else if (this.pieceType == 1) {
      //QUEEN
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y
        if (x > 7 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y
        if (x < 0 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y - i
        if (y < 0 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x
        let y = this.y + i
        if (y > 7 || indexOfoPieceAt(x, y) >= 0) {
          break
        }
        if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        }
        cells.push([x, y, 0])
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y + i
        if (x >= 8 || y >= 8) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y + i
        if (x < 0 || y >= 8) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x + i
        let y = this.y - i
        if (x >= 8 || y < 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
      for (let i = 1; ; i++) {
        let x = this.x - i
        let y = this.y - i
        if (x < 0 || y < 0) {
          break
        }
        if (indexOfoPieceAt(x, y) >= 0) {
          break
        } else if (indexOfuPieceAt(x, y) >= 0) {
          cells.push([x, y, 1])
          break
        } else {
          cells.push([x, y, 0])
        }
      }
    } else if (this.pieceType == 0) {
      //KING
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (!(i == 0 && j == 0)) {
            let x = this.x + i
            let y = this.y + j
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
              if (indexOfoPieceAt(x, y) < 0) {
                if (indexOfuPieceAt(x, y) >= 0) {
                  cells.push([x, y, 1])
                } else {
                  cells.push([x, y, 0])
                }
              }
            }
          }
        }
      }
    }
    return cells
  }
}

function indexOfSelectedPiece () {
  let flag = 0
  for (let i = 0; i < uPieces.length; i++) {
    if (uPieces[i].selected) {
      flag = 1
      return i
    }
  }
  if (!flag) {
    return -1
  }
}

function indexOfuPieceAt (x, y) {
  let flag = 0
  for (let i = 0; i < uPieces.length; i++) {
    if (uPieces[i].x == x && uPieces[i].y == y) {
      flag = 1
      return i
    }
  }
  if (!flag) {
    return -1
  }
}

function indexOfoPieceAt (x, y) {
  let flag = 0
  for (let i = 0; i < oPieces.length; i++) {
    if (oPieces[i].x == x && oPieces[i].y == y) {
      flag = 1
      return i
    }
  }
  if (!flag) {
    return -1
  }
}

function refresh () {
  uPieces = []
  oPieces = []
  for (let i = 0; i < 8; i++) {
    uPieces.push(new Piece(i, 6, userC, 5))
    oPieces.push(new Piece(i, 1, 1 - userC, 5))
  }
  for (let i = 0; i < 3; i++) {
    uPieces.push(new Piece(2 - i, 7, userC, 2 + i))
    uPieces.push(new Piece(5 + i, 7, userC, 2 + i))
    oPieces.push(new Piece(2 - i, 0, 1 - userC, 2 + i))
    oPieces.push(new Piece(5 + i, 0, 1 - userC, 2 + i))
  }
  for (let i = 0; i < 2; i++) {
    uPieces.push(new Piece(i + 3, 7, userC, 1 - i))
    oPieces.push(new Piece(i + 3, 0, 1 - userC, 1 - i))
  }
  if (userC == 1) {
    bg = loadImage('/assets/chessboard-flipped.png')
  } else {
    bg = loadImage('/assets/chessboard.png')
  }
}

function preload () {
  bg = loadImage('assets/chessboard.png')
  sprites = loadImage('/assets/pieces.svg.png')
}

function mousePressed () {
  if (wait == 0) {
    let i = floor(mouseX / cellEdge)
    let j = floor(mouseY / cellEdge)
    let index = indexOfuPieceAt(i, j)

    watchedCells.forEach(cell => {
      if (i == cell[0] && j == cell[1]) {
        let selected = indexOfSelectedPiece()
        socket.emit('move', {
          currentX: uPieces[selected].x,
          currentY: 7 - uPieces[selected].y,
          x: i,
          y: 7 - j,
          attack: cell[2],
          opponent: opponent
        })
        uPieces[selected].x = i
        uPieces[selected].y = j
        if (cell[2] == 1) {
          oPieces.splice(indexOfoPieceAt(i, j), 1)
        }
        uPieces[selected].selected = false
        wait = 1
        return 0
      }
    })
    watchedCells = []
    uPieces.forEach(piece => {
      piece.selected = false
    })
    if (index >= 0) {
      uPieces[index].selected = true
      uPieces[index].show()
    }
  }
}

function setup () {
  createCanvas(700, 700)
  cellEdge = (width - 2 * sOffset) / 8
  refresh()
  room = createDiv('')
  socket = io.connect('http://localhost:3000')
  username = document.getElementById('username').innerHTML
  socket.on('roomFull', () => {
    window.location.href = 'http://localhost:3000/account'
  })
  socket.on('startGame', players => {
    if (players[0] == socket.id) {
      userC = 0
      opponent = players[1]
    } else {
      userC = 1
      opponent = players[0]
    }
    state = 0
    wait = userC
    refresh()
    socket.emit('getNameFrom', opponent)
  })
  socket.on('nameRequest', () => {
    socket.emit('sendNameToOpponent', { opponent, username })
  })
  socket.on('oppName', name => {
    document.getElementById('head-message').innerHTML =
      document.getElementById('head-message').innerHTML + ' against ' + name
  })
  socket.on('move', data => {
    let index = indexOfoPieceAt(data.currentX, data.currentY)
    oPieces[index].x = data.x
    oPieces[index].y = data.y
    if (data.attack == 1) {
      uPieces.splice(indexOfuPieceAt(data.x, data.y), 1)
    }
    if (isDefendingCheck()) {
      check = 1
      if (underCheckmate()) {
        socket.emit('win', opponent)
        socket.emit('loss', socket.id)
      }
    } else {
      check = 0
    }
    wait = 0
  })
  socket.on('gameOver', result => {
    state = 2
    if (result == 1) {
      endStatus = ' You Win!'
      socket.emit('registerWin', username)
    } else {
      endStatus = ' You Lose.'
      socket.emit('registerLoss', username)
    }
  })
  socket.on('connectToRoom', () => {
    let s = window.location.search
    if (s.search('room=') != -1) {
      let roomno = ''
      let t = 0
      for (let i = 0; i < s.length; i++) {
        if (s[i] == '=') {
          t = 1
        } else if (t == 1) {
          roomno = roomno.concat(s[i])
        }
      }
      room.html('You are in room no. ' + roomno)
      socket.emit('join', parseInt(roomno, 10))
    }
  })
}

function draw () {
  if (state == 0) {
    background(bg)
    translate(sOffset, sOffset)
    cellEdge = (width - 2 * sOffset) / 8

    uPieces.forEach(piece => {
      piece.show()
    })

    oPieces.forEach(piece => {
      piece.show()
    })
  } else if (state == 1) {
    background(51)
    push()
    textSize(64)
    fill(255)
    text(
      'Waiting for opponent to join room....',
      15,
      height / 2 - 64,
      width - 15,
      height / 2
    )
    pop()
  } else {
    background(51)
    push()
    textSize(64)
    fill(255)
    text('Game Over.' + endStatus, 15, height / 2 - 32, width - 15, height / 2)
    pop()
  }
}

function allPossibleMoves (pieces) {
  let allMoves = []
  pieces.forEach(piece => {
    let moves
    if (pieces[0].userType == userC) {
      moves = piece.validMoves()
    } else {
      moves = piece.oppValidMoves()
    }

    moves.forEach(move => {
      allMoves.push(move)
    })
  })
  return allMoves
}

function isDefendingCheck () {
  let king
  let opponentMoves = allPossibleMoves(oPieces)
  uPieces.forEach(piece => {
    if (piece.pieceType == 0) {
      king = piece
    }
  })
  let check = [king.x, king.y, 1]

  return bIna(opponentMoves, check)
}

function willPutKingInDanger (x1, y1, x2, y2) {
  let index = indexOfuPieceAt(x1, y1)
  uPieces[index].x = x2
  uPieces[index].y = y2
  let oIndex = indexOfoPieceAt(x2, y2)
  let lostPiece
  if (oIndex >= 0) {
    lostPiece = oPieces.splice(oIndex, 1)
  }

  let check = isDefendingCheck()

  uPieces[index].x = x1
  uPieces[index].y = y1
  if (oIndex >= 0) {
    oPieces.push(lostPiece[0])
  }
  return check
}

function underCheckmate () {
  let checkmate = true
  uPieces.forEach(piece => {
    let moves = piece.validMoves()
    moves.forEach(move => {
      let x = piece.x
      let y = piece.y
      piece.x = move[0]
      piece.y = move[1]
      let lostPiece
      if (move[2] == 1) {
        lostPiece = oPieces.splice(indexOfoPieceAt(piece.x, piece.y), 1)
      }

      if (!isDefendingCheck()) {
        checkmate = false
      }

      piece.x = x
      piece.y = y
      if (move[2] == 1) {
        oPieces.push(lostPiece[0])
      }
    })
  })
  return checkmate
}

function bIna (a, b) {
  let t = false
  a.forEach(element => {
    if (element[0] == b[0] && element[1] == b[1] && element[2] == b[2]) {
      t = true
    }
  })
  return t
}

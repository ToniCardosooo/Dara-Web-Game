var putPhase;
var board;
var selected;
var remove;
var rselected;
var cselected;
var lastmove;
var playerPieces;
var winner;
var currPlayer;

//by default and can be changed in configurations
var rows = 6;
var columns = 5;
var startingPlayer = 1;
var secondPlayer = 0; //=0 se player vs player e =1 se player vs AI
var AI_diff = 0; // =0 se easy =1 se medium =3 se hard

// stats for the classificaition table
var classifications = [];
var stats = {
  player: 1,
  board_size: rows.toString() + "x" + columns.toString(),
  num_moves: 0,
  num_pieces_eaten: 0,
  match_duration: 0,
};

function updateClassificationTable() {
  let table = document.getElementById("classifications-table");

  for (let i = 0; i < classifications.length; i++) {
    let table_row = document.getElementById(i.toString() + "-row");
    table_row.remove();
  }

  //para orderar as classificacoes - do later
  classifications.push(stats);
  classifications = classifications.sort((stat1, stat2) => {
    return stat1.num_moves - stat2.num_moves;
  });

  for (let i = 0; i < classifications.length; i++) {
    let table_row = document.createElement("tr");
    table_row.id = i.toString() + "-row";
    for (let [key, value] of Object.entries(stats)) {
      let cell = document.createElement("td");
      cell.textContent = value;
      table_row.append(cell);
    }
    table.append(table_row);
  }
  // reset stats
  stats = {
    player: 1,
    board_size: rows.toString() + "x" + columns.toString(),
    num_moves: 0,
    num_pieces_eaten: 0,
    match_duration: 0,
  };
}

function updateStats(parameter) {
  if (currPlayer == 1) stats[parameter]++;
}

window.onload = function () {
  setLeft();
  setRigth();
};

function startGame() {
  setGame();
  updateSideBoards();
  document.getElementById("quit-game-button").textContent = "GIVE UP";
}

function switchPage(from_id, to_id) {
  let from_doc = document.getElementById(from_id);
  let to_doc = document.getElementById(to_id);

  from_doc.style.display = "none";
  to_doc.style.display = "flex";
}

function setBoardSize(size) {
  if (size === "0") {
    rows = 6;
    columns = 5;
  } else if (size === "1") {
    rows = 7;
    columns = 6;
  } else if (size === "2") {
    rows = 8;
    columns = 7;
  } else if (size === "3") {
    rows = 9;
    columns = 8;
  }

  let board = document.getElementById("board");
  board.style.width = columns * 90 + "px";
  board.style.height = rows * 90 + "px";

  clearboard();
}

function clearboard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      tile.remove();
    }
  }
}

function setLeft() {
  for (let r = 0; r < 6; r++) {
    let row = [];
    for (let c = 0; c < 2; c++) {
      row.push(0);
      let tile = document.createElement("div");
      tile.id = "E" + r.toString() + "-" + c.toString();
      tile.classList.add("tile");
      document.getElementById("esquerda").append(tile);
    }
  }
}

function setRigth() {
  boardrigth = [];
  for (let r = 0; r < 6; r++) {
    let row = [];
    for (let c = 0; c < 2; c++) {
      row.push(0);
      let tile = document.createElement("div");
      tile.id = "R" + r.toString() + "-" + c.toString();
      tile.classList.add("tile");
      document.getElementById("direita").append(tile);
    }
    boardrigth.push(row);
  }
}

function setGame() {
  let win = document.getElementById("winner");
  win.innerText = "";
  board = [];
  currPlayer = startingPlayer;
  playerPieces = [0, 0];
  lastmove = [-1, -1, -1, -1, -1, -1, -1, -1];
  winner = 0;
  putPhase = true;
  selected = false;
  remove = false;

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < columns; c++) {
      // JS
      row.push(0);
      // HTML
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();
      tile.classList.add("tile");
      tile.addEventListener("click", onClick);
      document.getElementById("board").append(tile);
    }
    board.push(row);
  }
  updateBoard();

  let text = document.getElementById("text");
  let s = "";
  if (currPlayer == 1) {
    s += "Red ";
  } else {
    s += "Yellow ";
  }
  s += "Player to put a piece";
  text.innerText = s;
}

function updateBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      if (board[r][c] == 1) {
        tile.classList.add("red-piece");
      }
      if (board[r][c] == 2) {
        tile.classList.add("yellow-piece");
      }
      if (board[r][c] == 0) {
        tile.classList.remove("red-shallow");
        tile.classList.remove("yellow-shallow");
        tile.classList.remove("red-piece");
        tile.classList.remove("yellow-piece");
      }
    }
  }
}

function updateSideBoards() {
  count = 12 - playerPieces[0];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 2; c++) {
      let tile = document.getElementById(
        "E" + r.toString() + "-" + c.toString()
      );
      if (count > 0) {
        tile.classList.add("red-piece");
        count--;
      } else {
        tile.classList.remove("red-piece");
      }
    }
  }
  count = 12 - playerPieces[1];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 2; c++) {
      let tile = document.getElementById(
        "R" + r.toString() + "-" + c.toString()
      );
      if (count > 0) {
        tile.classList.add("yellow-piece");
        count--;
      } else {
        tile.classList.remove("yellow-piece");
      }
    }
  }
}

function onClick() {
  if (winner != 0) {
    return;
  }

  //get coords of that tile clicked
  let coords = this.id.split("-");
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);

  let text = document.getElementById("text");
  let s = "";

  //Put Phase
  if (putPhase) {
    if (CanPut(r, c, currPlayer, 0, 0)) {
      board[r][c] = currPlayer;
      playerPieces[currPlayer - 1]++;
      currPlayer = 3 - currPlayer;
      updateBoard();
      updateSideBoards();
      if (playerPieces[0] + playerPieces[1] == 24) {
        putPhase = false;
        if (currPlayer == 1) {
          s += "Red ";
        } else {
          s += "Yellow ";
        }
        s += "Player to select a piece";
      } else {
        if (currPlayer == 1) {
          s += "Red ";
        } else {
          s += "Yellow ";
        }
        s += "Player to put a piece";
      }
    } else {
      s += "Cannot put a piece there";
    }
  }

  //Move Phase
  else {
    if (!selected) {
      //select a piece to move
      if (canPick(r, c, currPlayer)) {
        selected = true;
        rselected = r;
        cselected = c;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        if (board[r][c] == 1) {
          tile.classList.remove("red-piece");
          tile.classList.add("red-shallow");
        }
        if (board[r][c] == 2) {
          tile.classList.remove("yellow-piece");
          tile.classList.add("yellow-shallow");
        }
        if (currPlayer == 1) {
          s += "Red ";
        } else {
          s += "Yellow ";
        }
        s += "Player to move the piece";
      } else {
        s += "Cannot select that piece";
      }
    } else {
      if (remove) {
        //remove a opponent piece
        if (board[r][c] == 3 - currPlayer) {
          board[r][c] = 0;
          updateStats("num_pieces_eaten");
          currPlayer = 3 - currPlayer;
          playerPieces[currPlayer - 1]--;
          selected = false;
          remove = false;
          updateBoard();
          updateSideBoards();
          if (currPlayer == 1) {
            s += "Red ";
          } else {
            s += "Yellow ";
          }
          s += "Player to select a piece";
          checkWinner();
        } else {
          s += "Cannot remove that piece";
        }
      } else {
        // mover a peça
        if (r == rselected && c == cselected) {
          //se clicar na mesma peça, volta a poder selecionar outra
          selected = false;
          let tile = document.getElementById(r.toString() + "-" + c.toString());
          if (board[r][c] == 1) {
            tile.classList.remove("red-shallow");
            tile.classList.add("red-piece");
          }
          if (board[r][c] == 2) {
            tile.classList.remove("yellow-shallow");
            tile.classList.add("yellow-piece");
          }
          if (currPlayer == 1) {
            s += "Red ";
          } else {
            s += "Yellow ";
          }
          s += "Player to select a piece";
        } else {
          if (
            CanPut(r, c, currPlayer, rselected, cselected) &&
            CanMove(r, c, rselected, cselected) &&
            !Repeat(lastmove, r, c, rselected, cselected, currPlayer)
          ) {
            board[r][c] = currPlayer;
            board[rselected][cselected] = 0;
            lastmove[(currPlayer - 1) * 4] = r;
            lastmove[(currPlayer - 1) * 4 + 1] = c;
            lastmove[(currPlayer - 1) * 4 + 2] = rselected;
            lastmove[(currPlayer - 1) * 4 + 3] = cselected;
            updateBoard();
            updateSideBoards();
            updateStats("num_moves");
            if (createsLine(r, c, currPlayer)) {
              remove = true;
              if (currPlayer == 1) {
                s += "Red ";
              } else {
                s += "Yellow ";
              }
              s += "Player to remove a opponent piece";
            } else {
              currPlayer = 3 - currPlayer;
              selected = false;
              checkWinner();
              if (currPlayer == 1) {
                s += "Red ";
              } else {
                s += "Yellow ";
              }
              s += "Player to select a piece";
            }
          } else {
            s += "Cannot move piece there";
          }
        }
      }
    }
  }
  if (winner == 0) {
    text.innerText = s;
  } else {
    text.innerText = "";
  }
}

function CanPut(r, c, currPlayer, rselected, cselected) {
  //Check is Empty
  if (board[r][c] != 0) {
    return false;
  }

  if (!putPhase) {
    board[rselected][cselected] = 0;
  }

  board[r][c] = currPlayer;

  //Check Horizontal
  let min = Math.max(0, c - 3);
  let max = Math.min(columns - 4, c);

  for (let i = min; i <= max; i++) {
    if (
      currPlayer == board[r][i] &&
      board[r][i] == board[r][i + 1] &&
      board[r][i + 1] == board[r][i + 2] &&
      board[r][i + 2] == board[r][i + 3]
    ) {
      board[r][c] = 0;
      if (!putPhase) {
        board[rselected][cselected] = currPlayer;
      }
      return false;
    }
  }

  // Check Vertical
  min = Math.max(0, r - 3);
  max = Math.min(rows - 4, r);

  for (let i = min; i <= max; i++) {
    if (
      currPlayer == board[i][c] &&
      board[i][c] == board[i + 1][c] &&
      board[i + 1][c] == board[i + 2][c] &&
      board[i + 2][c] == board[i + 3][c]
    ) {
      board[r][c] = 0;
      if (!putPhase) {
        board[rselected][cselected] = currPlayer;
      }
      return false;
    }
  }
  board[r][c] = 0;
  if (!putPhase) {
    board[rselected][cselected] = currPlayer;
  }
  return true;
}

//
function canPick(r, c, currPlayer) {
  return board[r][c] == currPlayer;
}

function CanMove(r, c, rselected, cselected) {
  if (r == rselected && Math.abs(c - cselected) == 1) {
    return true;
  }
  if (c == cselected && Math.abs(r - rselected) == 1) {
    return true;
  }
  return false;
}
function createsLine(r, c, currPlayer) {
  //Check Horizontal
  let min = Math.max(0, c - 2);
  let max = Math.min(columns - 3, c);

  for (let i = min; i <= max; i++) {
    if (
      currPlayer == board[r][i] &&
      board[r][i] == board[r][i + 1] &&
      board[r][i + 1] == board[r][i + 2]
    ) {
      return true;
    }
  }

  // Check Vertical
  min = Math.max(0, r - 2);
  max = Math.min(rows - 3, r);

  for (let i = min; i <= max; i++) {
    if (
      currPlayer == board[i][c] &&
      board[i][c] == board[i + 1][c] &&
      board[i + 1][c] == board[i + 2][c]
    ) {
      return true;
    }
  }
  return false;
}

function Repeat(lastmove, r, c, rselected, cselected, currPlayer) {
  return (
    lastmove[(currPlayer - 1) * 4] == rselected &&
    lastmove[(currPlayer - 1) * 4 + 1] == cselected &&
    lastmove[(currPlayer - 1) * 4 + 2] == r &&
    lastmove[(currPlayer - 1) * 4 + 3] == c
  );
}

function hasMoves(currPlayer, lastmove, rows, columns) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (board[i][j] == currPlayer) {
        if (i > 0) {
          if (
            CanPut(i - 1, j, currPlayer, i, j) &&
            !Repeat(lastmove, i - 1, j, i, j, currPlayer)
          ) {
            return true;
          }
        }
        if (i < rows - 1) {
          if (
            CanPut(i + 1, j, currPlayer, i, j) &&
            !Repeat(lastmove, i + 1, j, i, j, currPlayer)
          ) {
            return true;
          }
        }
        if (j > 0) {
          if (
            CanPut(i, j - 1, currPlayer, i, j) &&
            !Repeat(lastmove, i, j - 1, i, j, currPlayer)
          ) {
            return true;
          }
        }
        if (j < columns - 1) {
          if (
            CanPut(i, j + 1, currPlayer, i, j) &&
            !Repeat(lastmove, i, j + 1, i, j, currPlayer)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function checkWinner() {
  if (
    playerPieces[currPlayer - 1] <= 2 ||
    !hasMoves(currPlayer, lastmove, rows, columns)
  ) {
    winner = 3 - currPlayer;
    setWinner(winner);
  }
  return;
}

function setWinner(winner) {
  let win = document.getElementById("winner");
  if (winner == 1) {
    win.innerText = "Red Wins";
    updateClassificationTable();
  } else {
    win.innerText = "Yellow Wins";
  }

  document.getElementById("quit-game-button").innerText = "BACK TO MENU";
}

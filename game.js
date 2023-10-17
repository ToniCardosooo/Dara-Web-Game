

class Game  {
	constructor(){
		this.rows = 6;
		this.columns = 5;
		this.startingPlayer=1;
		this.secondPlayer = 0;//=0 se player vs player e =1 se player vs AI
		this.AI_diff = 0;// =0 se easy =1 se medium =2 se hard
		this.selected = false;
		this.remove = false;
		this.rselected;
		this.cselected;
		this.classifications = [];
		this.stats = {
		player_name: "",
		board_size: this.rows.toString() + "x" + this.columns.toString(),
		num_moves: 0,
		num_pieces_eaten: 0,
		match_duration: 0,
		};
	}

	updateClassificationTable() {
		this.stats.board_size = this.rows.toString() + "x" + this.columns.toString();
	
		let table = document.getElementById("classifications-table");
	
		for (let i = 0; i < this.classifications.length; i++) {
			let table_row = document.getElementById(i.toString() + "-row");
			table_row.remove();
		}
	
		//para orderar as classificacoes - do later
		this.classifications.push(this.stats);
		this.classifications = this.classifications.sort((stat1, stat2) => {
			return stat1.num_moves - stat2.num_moves;
		});
	
		for (let i = 0; i < this.classifications.length; i++) {
			let table_row = document.createElement("tr");
			table_row.id = i.toString() + "-row";
			for (let [key, value] of Object.entries(this.classifications[i])) {
				let cell = document.createElement("td");
				cell.textContent = value;
				table_row.append(cell);
			}
			table.append(table_row);
		}
		// reset stats
		this.stats = {
			player: 1,
			board_size: this.rows.toString() + "x" + this.columns.toString(),
			num_moves: 0,
			num_pieces_eaten: 0,
			match_duration: 0,
		};
	}

	updateStats(parameter) {
		if (this.board.player == 1) this.stats[parameter]++;
	}

	setPlayerName() {
		this.stats.player_name = document
			.getElementById("username-input")
			.value.toString();
	}

	setBoardSize(size) {
		if (size === "0") {
			this.rows = 6;
			this.columns = 5;
		} else if (size === "1") {
			this.rows = 7;
			this.columns = 6;
		} else if (size === "2") {
			this.rows = 8;
			this.columns = 7;
		} else if (size === "3") {
			this.rows = 9;
			this.columns = 8;
		} 
		let board = document.getElementById("board");
		board.style.width = this.columns * 90 + "px";
		board.style.height = this.rows * 90 + "px";
	}

	setGameMode(mode) {
		if (mode == 0) { this.secondPlayer = 0; document.getElementById("ai-difficulty").style.display = "none"; }
		else { this.secondPlayer = 1;document.getElementById("ai-difficulty").style.display = "flex"; }
	}
	
	setStartPlayer(player) {
		if (player == 0) { this.startingPlayer = 1; }
		else { this.startingPlayer = 2; }
	}
	
	setAIdiff(diff) {
		if (diff == 0) { this.AI_diff = 0; }
		else if (diff == 1) { this.AI_diff = 1; }
		else { this.AI_diff = 2; }
	}

	start(){
		//setBoardSize(document.getElementById("board-size-select").value);
		this.board = new Board(this.rows,this.columns,this.startingPlayer);
		this.board.createSideBoards();
		//setGame();
		this.board.updateSideBoards();
		document.getElementById("quit-game-button").textContent = "GIVE UP";
		this.showMessage();
	}

	Select(r,c){
		this.selected = true;
		this.rselected = r;
		this.cselected = c;
		let tile = document.getElementById(r.toString() + "-" + c.toString());
		if (this.board.board[r][c] == 1) {
			tile.classList.remove("red-piece");
			tile.classList.add("red-shallow");
		}
		if (this.board.board[r][c] == 2) {
			tile.classList.remove("yellow-piece");
			tile.classList.add("yellow-shallow");
		}
	}

	Unselect(r,c){
		this.selected = false;
		let tile = document.getElementById(r.toString() + "-" + c.toString());
		if (this.board.board[r][c] == 1) {
			tile.classList.remove("red-shallow");
			tile.classList.add("red-piece");
		}
		if (this.board.board[r][c] == 2) {
			tile.classList.remove("yellow-shallow");
			tile.classList.add("yellow-piece");
		}
	}

	showMessage(error){
		let message = document.getElementById("text");
		if (this.board.winner != 0){
			message.innerText = "";
		}
		else{
			if (this.board.putPhase){
				let s;
				if (this.board.player == 1){
					s = "Red";
				}
				else{
					s = "Yellow";
				}
				if (error){message.innerText = s + " player cannot put a piece there";}
				else {message.innerText = s + " player to put a piece";}
			}

			else{
				if (!this.selected) {
					let s;
					if (this.board.player == 1){
						s = "Red";
					}
					else{
						s = "Yellow";
					}
					if (error){message.innerText = s + " player cannot sellect that piece";}
					else {message.innerText = s + " player to select a piece";}
				}

				else{
					if (!this.remove) {
						let s;
						if (this.board.player == 1){
							s = "Red";
						}
						else{
							s = "Yellow";
						}
						if (error){message.innerText = s + " player cannot move that piece there";}
						else {message.innerText = s + " player to move the selected piece";}
					}

					else {
						let s;
						if (this.board.player == 1){
							s = "Red";
						}
						else{
							s = "Yellow";
						}
						if (error){message.innerText = s + " player cannot remove that piece";}
						else {message.innerText = s + " player to remove a opponent piece";} 
					}
				}
			}
		}
	}
	
	showWinner() {
		let win = document.getElementById("winner");
		if (this.board.winner == 1) {
			win.innerText = "Red Wins";
			this.updateClassificationTable();
		} 
		else if (this.board.winner == 2) {
			win.innerText = "Yellow Wins";
		}
	
		document.getElementById("quit-game-button").innerText = "BACK TO MENU";
	}


	Click(r,c) {
		if (this.board.winner != 0) {
			console.log(this.board.winner);
			return;
		}

		let error = false;
		//Put Phase
		if (this.board.putPhase) {
			if (this.board.CanPut(r, c)) {
				this.board.Put(r,c)
				this.board.changePlayer();
			}
			else{error=true;}
		}
	
		//Move Phase
		else {
			if (!this.selected) {
				//select a piece to move
				if (this.board.canPick(r, c)) {
					this.Select(r,c);
				}
				else{error=true;}
			} 
			else {
				if (!this.remove) {
					// mover a peça
					if (r == this.rselected && c == this.cselected) {
						//se clicar na mesma peça, volta a poder selecionar outra
						this.Unselect(r,c);
					} 
					else {
						if (this.board.CanMove(r, c, this.rselected, this.cselected)) {
							this.board.Move(r,c,this.rselected,this.cselected);
							this.updateStats("num_moves");
							if (this.board.createsLine(r, c)) {
								this.remove = true;
							} 
							else {
								this.board.changePlayer();
								this.selected = false;
								this.board.checkWinner();
								this.showWinner();
							}
						}
						else{error=true;} 
					}
				}
				else {
					//remove a opponent piece
					if (this.board.CanRemove(r,c)) {
						this.board.Remove(r,c);
						this.updateStats("num_pieces_eaten");
						this.board.changePlayer();
						this.selected = false;
						this.remove = false;
						this.board.checkWinner();
						this.showWinner();
					}
					else{error=true;} 
				}
			} 
		}
		this.showMessage(error);
	}
}

class Board {
	constructor(rows, columns, startingPlayer) {
		this.rows = rows;
		this.columns = columns;
		this.player = startingPlayer;
		this.putPhase = true;
		this.winner = 0;
		this.lastmove = [[[-1, -1], [-1, -1]], [[-1, -1], [-1, -1]]];
		this.playerPieces = [0, 0];
		this.board = this.createBoard(rows, columns);
	}

	createBoard(rows,columns) {
		let board = [];
		for (let i=0;i<rows;i++){
			let line = [];
			for (let j=0;j<columns;j++){
				line.push(0);
				let tile = document.createElement("div");
				tile.id = i.toString() + "-" + j.toString();
				tile.classList.add("tile");
				tile.addEventListener("click", onClick);
				document.getElementById("board").append(tile);
			}
			board.push(line);
		}
		return board;	
	}

	createSideBoards() {
		for (let r = 0; r < 6; r++) {
			let row = [];
			for (let c = 0; c < 2; c++) {
				row.push(0);
				let tile_e = document.createElement("div");
				tile_e.id = "E" + r.toString() + "-" + c.toString();
				tile_e.classList.add("tile");
				document.getElementById("esquerda").append(tile_e);
				let tile_d = document.createElement("div");
				tile_d.id = "D" + r.toString() + "-" + c.toString();
				tile_d.classList.add("tile");
				document.getElementById("direita").append(tile_d);
			}
		}
	}

	updateBoard(r,c){
		let tile = document.getElementById(r.toString() + "-" + c.toString());
		if (this.board[r][c] == 1) {
			tile.classList.add("red-piece");
		}
		if (this.board[r][c] == 2) {
			tile.classList.add("yellow-piece");
		}
		if (this.board[r][c] == 0) {
			tile.classList.remove("red-shallow");
			tile.classList.remove("yellow-shallow");
			tile.classList.remove("red-piece");
			tile.classList.remove("yellow-piece");
		}
	}

	updateSideBoards() {
		let count = 12 - this.playerPieces[0];
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
		count = 12 - this.playerPieces[1];
		for (let r = 0; r < 6; r++) {
			for (let c = 0; c < 2; c++) {
				let tile = document.getElementById(
					"D" + r.toString() + "-" + c.toString()
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

	clear() {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				if (tile != null) {
					tile.remove();
				}
			}
		}
		
		for (let r = 0; r < 6; r++) {
			for (let c = 0; c < 2; c++) {
				let tile_e = document.getElementById("E" + r.toString() + "-" + c.toString());
				if (tile_e != null) {
					tile_e.remove();
				}
				let tile_d = document.getElementById("D" + r.toString() + "-" + c.toString());
				if (tile_d != null) {
					tile_d.remove();
				}
			}
		}
	}

	CanPut(r, c) {
		//Check is Empty
		if (this.board[r][c] != 0) {
			return false;
		}
	
		this.board[r][c] = this.player;
	
		//Check Horizontal
		let min = Math.max(0, c - 3);
		let max = Math.min(this.columns - 4, c);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[r][i] &&
				this.board[r][i] == this.board[r][i + 1] &&
				this.board[r][i + 1] == this.board[r][i + 2] &&
				this.board[r][i + 2] == this.board[r][i + 3]
			) {
				this.board[r][c] = 0;
				return false;
			}
		}
	
		// Check Vertical
		min = Math.max(0, r - 3);
		max = Math.min(this.rows - 4, r);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[i][c] &&
				this.board[i][c] == this.board[i + 1][c] &&
				this.board[i + 1][c] == this.board[i + 2][c] &&
				this.board[i + 2][c] == this.board[i + 3][c]
			) {
				this.board[r][c] = 0;
				return false;
			}
		}
		this.board[r][c] = 0;
		return true;
	}

	Put(r,c){
		this.board[r][c] = this.player;
		if (this.putPhase){this.playerPieces[this.player-1]++;}
		this.updateBoard(r,c);
		this.updateSideBoards();
		if (this.playerPieces[0] + this.playerPieces[1] == 24){this.putPhase = false;}
	}

	canPick(r, c) {
		return this.board[r][c] == this.player;
	}


	Repeat(r, c, rselected, cselected) {
		return (
			this.lastmove[this.player-1][0][0] == rselected &&
			this.lastmove[this.player-1][0][1] == cselected &&
			this.lastmove[this.player-1][1][0] == r &&
			this.lastmove[this.player-1][1][1] == c
		);
	}

	Move(r,c,rselected,cselected){
		this.board[r][c] = this.player;
		this.board[rselected][cselected] = 0;
		this.lastmove[this.player-1][0][0] = r;
		this.lastmove[this.player-1][0][1] = c;
		this.lastmove[this.player-1][1][0] = rselected;
		this.lastmove[this.player-1][1][1] = cselected;
		this.updateBoard(r,c);
		this.updateBoard(rselected,cselected);
	}

	createsLine(r, c) {
		//Check Horizontal
		let min = Math.max(0, c - 2);
		let max = Math.min(this.columns - 3, c);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[r][i] &&
				this.board[r][i] == this.board[r][i + 1] &&
				this.board[r][i + 1] == this.board[r][i + 2]
			) {
				return true;
			}
		}
	
		// Check Vertical
		min = Math.max(0, r - 2);
		max = Math.min(this.rows - 3, r);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[i][c] &&
				this.board[i][c] == this.board[i + 1][c] &&
				this.board[i + 1][c] == this.board[i + 2][c]
			) {
				return true;
			}
		}
		return false;
	}

	putPiece(r,c){
		this.board[r][c] = this.player;
		this.playerPieces[player-1] ++;
	}

	CanMove(r, c, rselected, cselected) {
		if (this.Repeat(r,c,rselected,cselected)){return false;}
		if ((r == rselected && Math.abs(c - cselected) == 1) || (c == cselected && Math.abs(r - rselected) == 1)) {
			this.board[rselected][cselected] = 0;
			if (this.CanPut(r,c)){
				this.board[rselected][cselected] = this.player;
				return true;
			}
			this.board[rselected][cselected] = this.player;
		}
		return false;
	}

	CanRemove(r,c){
		return this.board[r][c] == 3 - this.player;
	}

	Remove(r,c){
		this.board[r][c] = 0;
		this.playerPieces[2-this.player]--;
		this.updateBoard(r,c);
		this.updateSideBoards();
	}

	changePlayer(){
		this.player = 3-this.player;
	}

	hasMoves() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				if (this.board[i][j] == this.player) {
					if (i > 0) {
						if (this.CanMove(i-1,j,i,j)){
							return true;
						}
					}
					if (i < this.rows - 1) {
						if (this.CanMove(i+1,j,i,j)){
							return true;
						}
					}
					if (j > 0) {
						if (this.CanMove(i,j-1,i,j)){
							return true;
						}
					}
					if (j < this.columns - 1) {
						if (this.CanMove(i,j+1,i,j)){
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	checkWinner() {
		if (
			this.playerPieces[this.player - 1] <= 2 ||
			!this.hasMoves()
		) {
			this.winner = 3 - this.player;
		}
	}
}

var G = new Game();

function startGame(){
	G.start();
}

function changePlayerName() {
	G.setPlayerName();
}

function changeBoardSize(size) {
	G.setBoardSize(size);
}

function changeGameMode(mode){
	G.setGameMode(mode);
}

function changeStartPlayer(player){
	G.setStartPlayer(player);
}

function changeAIdiff(diff){
	G.setAIdiff(diff);
}

function clearboard() {
	G.board.clear();
}

function onClick() {
	let coords = this.id.split("-");
	let r = parseInt(coords[0]);
	let c = parseInt(coords[1]);
	G.Click(r,c);
}

function switchPage(from_id, to_id) {
	let from_doc = document.getElementById(from_id);
	let to_doc = document.getElementById(to_id);

	from_doc.style.display = "none";
	to_doc.style.display = "flex";
}

function everymove(currPlayer, putPhase, board) {
	let boardcopy = copy_array(board);
	let moves = [];
	if (putPhase) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				if (CanPut(i, j, currPlayer, 0, 0, boardcopy)) {
					let move = [i, j];
					moves.push(move);
				}
			}
		}
	} else {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				let move = [];
				if (boardcopy[i][j] == currPlayer) {
					if (i > 0) {
						if (
							CanPut(i - 1, j, currPlayer, i, j, boardcopy) &&
							!Repeat(lastmove, i - 1, j, i, j, currPlayer)
						) {
							move.push([i, j]);
							move.push([i - 1, j]);
							boardcopy[i - 1][j] = currPlayer;
							boardcopy[i][j] = 0;
							if (createsLine(i - 1, j, currPlayer, boardcopy)) {
								for (let k = 0; k < rows; k++) {
									for (let l = 0; l < columns; l++) {
										if (boardcopy[k][l] == 3 - currPlayer) {
											move.push([k, l]);
											moves.push(move);
											move.pop();
										}
									}
								}
							} else {
								moves.push(move);
							}
							move = [];
							boardcopy[i - 1][j] = 0;
							boardcopy[i][j] = currPlayer;
						}
					}
					if (i < rows - 1) {
						if (
							CanPut(i + 1, j, currPlayer, i, j, boardcopy) &&
							!Repeat(lastmove, i + 1, j, i, j, currPlayer)
						) {
							move.push([i, j]);
							move.push([i + 1, j]);
							boardcopy[i + 1][j] = currPlayer;
							boardcopy[i][j] = 0;
							if (createsLine(i + 1, j, currPlayer, boardcopy)) {
								for (let k = 0; k < rows; k++) {
									for (let l = 0; l < columns; l++) {
										if (boardcopy[k][l] == 3 - currPlayer) {
											move.push([k, l]);
											moves.push(move);
											move.pop();
										}
									}
								}
							} else {
								moves.push(move);
							}
							move = [];
							boardcopy[i + 1][j] = 0;
							boardcopy[i][j] = currPlayer;
						}
					}
					if (j > 0) {
						if (
							CanPut(i, j - 1, currPlayer, i, j, boardcopy) &&
							!Repeat(lastmove, i, j - 1, i, j, currPlayer)
						) {
							move.push([i, j]);
							move.push([i, j - 1]);
							boardcopy[i][j - 1] = currPlayer;
							boardcopy[i][j] = 0;
							if (createsLine(i, j - 1, currPlayer, boardcopy)) {
								for (let k = 0; k < rows; k++) {
									for (let l = 0; l < columns; l++) {
										if (boardcopy[k][l] == 3 - currPlayer) {
											move.push([k, l]);
											moves.push(move);
											move.pop();
										}
									}
								}
							} else {
								moves.push(move);
							}
							move = [];
							boardcopy[i][j - 1] = 0;
							boardcopy[i][j] = currPlayer;
						}
					}
					if (j < columns - 1) {
						if (
							CanPut(i, j + 1, currPlayer, i, j, boardcopy) &&
							!Repeat(lastmove, i, j + 1, i, j, currPlayer)
						) {
							move.push([i, j]);
							move.push([i, j + 1]);
							boardcopy[i][j + 1] = currPlayer;
							boardcopy[i][j] = 0;
							if (createsLine(i, j + 1, currPlayer, boardcopy)) {
								for (let k = 0; k < rows; k++) {
									for (let l = 0; l < columns; l++) {
										if (boardcopy[k][l] == 3 - currPlayer) {
											move.push([k, l]);
											moves.push(move);
											move.pop();
										}
									}
								}
							} else {
								moves.push(move);
							}
							move = [];
							boardcopy[i][j + 1] = 0;
							boardcopy[i][j] = currPlayer;
						}
					}
				}
			}
		}
	}
	return moves;
}

function copy_array(array) {
	let copy = [];
	for (let i = 0; i < array.length; i++) {
		copy[i] = array[i].slice();
	}
	return copy;
}

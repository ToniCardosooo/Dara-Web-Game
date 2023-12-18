module.exports.Board_Server = class Board_Server{
	constructor(rows, columns, startingPlayer) {
		this.rows = rows;
		this.columns = columns;
		this.player = startingPlayer;
		this.putPhase = true; // if we are in the put phase
		this.winner = 0;
		this.lastmove = [[[-1, -1], [-1, -1]], [[-1, -1], [-1, -1]]]; // a record of each player's last move
		this.playerPieces = [0, 0]; // a count of each player's pieces
		this.board = this.createBoard(rows, columns);
	}

	// creating the 2D array that will represent the game
	createBoard(rows,columns) {
		let board = [];
		for (let i=0;i<rows;i++){
			let line = [];
			for (let j=0;j<columns;j++){
				line.push(0);
			}
			board.push(line);
		}
		return board;	
	}





	// can the player puc a piece on this space
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
	
	// puting a player's piece on the space
	Put(r,c){
		this.board[r][c] = this.player;
		if (this.putPhase){this.playerPieces[this.player-1]++;}
		if (this.playerPieces[0] + this.playerPieces[1] == 24){this.putPhase = false;}
	}

	// can the player select a piece
	canPick(r, c) {
		return this.board[r][c] == this.player;
	}

	// is this move a repeat of the last one
	Repeat(rselected, cselected, r, c) {
		return (
			this.lastmove[this.player-1][0][0] == r &&
			this.lastmove[this.player-1][0][1] == c &&
			this.lastmove[this.player-1][1][0] == rselected &&
			this.lastmove[this.player-1][1][1] == cselected
		);
	}

	// moving a player's piece
	Move(rselected,cselected,r,c){
		this.board[r][c] = this.player;
		this.board[rselected][cselected] = 0;
		this.lastmove[this.player-1][0][0] = rselected;
		this.lastmove[this.player-1][0][1] = cselected;
		this.lastmove[this.player-1][1][0] = r;
		this.lastmove[this.player-1][1][1] = c;
	}

	// does this move create a line of 3
	createsLine(r, c) {
		//Check Horizontal
		let min = Math.max(0, c - 2);
		let max = Math.min(this.columns - 3, c);
	
		for (let i = min; i <= max; i++) {
			if (
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
				this.board[i][c] == this.board[i + 1][c] &&
				this.board[i + 1][c] == this.board[i + 2][c]
			) {
				return true;
			}
		}
		return false;
	}

	// can a player make this move
	CanMove(rselected, cselected,r,c) {
		if (this.Repeat(rselected,cselected,r,c)){return false;}
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

	// can a player remove this piece
	CanRemove(r,c){
		return this.board[r][c] == 3 - this.player;
	}

	// removing a opponent's piece
	Remove(r,c){
		this.board[r][c] = 0;
		this.playerPieces[2-this.player]--;
	}

	// changing wich player plays next
	changePlayer(){
		this.player = 3-this.player;
	}

	// does this player have any moves left
	hasMoves() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				if (this.board[i][j] == this.player) {
					if (i > 0) {
						if (this.CanMove(i,j,i-1,j)){
							return true;
						}
					}
					if (i < this.rows - 1) {
						if (this.CanMove(i,j,i+1,j)){
							return true;
						}
					}
					if (j > 0) {
						if (this.CanMove(i,j,i,j-1)){
							return true;
						}
					}
					if (j < this.columns - 1) {
						if (this.CanMove(i,j,i,j+1)){
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	// is the game over
	checkWinner() {
		if (
			this.playerPieces[this.player - 1] <= 2 ||
			!this.hasMoves()
		) {
			this.winner = 3 - this.player;
		}
	}
}

module.exports.copy_2darray = function copy_2darray(array) {
	let copy = [];
	for (let i = 0; i < array.length; i++) {
		copy[i] = array[i].slice();
	}
	return copy;
}
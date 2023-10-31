

class Game  {
	constructor(){
		this.rows = 6;
		this.columns = 5;
		this.startingPlayer=1;
		this.secondPlayer = 0;//=0 se player vs player e =1 se player vs AI
		this.AI_diff = 0;// =0 se easy =1 se medium =2 se hard
		this.selected = false; // is a piece selected to move
		this.remove = false; // can remove a opponent piece
		this.rselected;
		this.cselected;
		this.match_history = [];
		this.players_stats = {};
		this.stats = {
			player_name: "",
			match_result: "",
			board_size: this.rows.toString() + " X " + this.columns.toString(),
			game_mode: "Player X ",
			num_moves: 0,
			num_pieces_eaten: 0,
			score: 0,
		};
	}

	updateWinRateTable(has_won){
		let win_rate_table = document.getElementById("win-rate-table");
		let player_name = this.stats.player_name;
		if (this.players_stats[player_name] !== undefined){
			for (let i = 0; i < win_rate_table.rows.length; i++){
				if (win_rate_table.rows[i].cells[0].innerText != player_name){ continue; }
				// update win_rate_table relevant stats
				if (has_won){
					this.players_stats[player_name]["win_count"]++;
					this.players_stats[player_name]["total_score"] += this.stats.score;
				}
				else{ this.players_stats[player_name]["total_score"] += this.stats.score; }
				this.players_stats[player_name]["matches_count"]++;
			}
		}
		else{
			// update win_rate_table relevant stats
			this.players_stats[player_name] = (has_won)?
			{"win_count": 1, "matches_count": 1, "total_score": this.stats.score}: // has won
			{"win_count": 0, "matches_count": 1, "total_score": this.stats.score}; // has not won
			// create new line on the table
			let new_row = document.createElement("tr");
			// add the player name
			let cell = document.createElement("td");
			cell.textContent = player_name;
			new_row.append(cell);
			// add the player win rate (at this point, either 0% or 100%)
			cell = document.createElement("td");
			cell.textContent = (has_won)? "100%" : "0%";
			new_row.append(cell);
			// add the player total score
			cell = document.createElement("td");
			cell.textContent = this.stats.score.toString();
			new_row.append(cell);
			// append row
			win_rate_table.append(new_row);
		}
		// create array of the players_stats
		let win_rate_classifications = Object.keys(this.players_stats).map(
			(key) => {return [key, this.players_stats[key]];}
		);
		// sort it
		win_rate_classifications = win_rate_classifications.sort((player1, player2) => {
			let p1_win_rate = Math.round(player1[1]["win_count"]/player1[1]["matches_count"] * 100);
			let p2_win_rate = Math.round(player2[1]["win_count"]/player2[1]["matches_count"] * 100);
			if (p1_win_rate == p2_win_rate){
				return player2[1]["total_score"] - player1[1]["total_score"];
			}
			return p2_win_rate - p1_win_rate;
		});
		// update win rate table
		for (let i = 1; i < win_rate_table.rows.length; i++){
			win_rate_table.rows[i].cells[0].innerText = win_rate_classifications[i-1][0];
			win_rate_table.rows[i].cells[1].innerText = Math.round(win_rate_classifications[i-1][1]["win_count"]/win_rate_classifications[i-1][1]["matches_count"] * 100).toString() + "%";
			win_rate_table.rows[i].cells[2].innerText = win_rate_classifications[i-1][1]["total_score"].toString();
		}
	}

	filterClassificationTable(){
		// clean the table
		let table = document.getElementById("classifications-table");

		// filter the match_history with the given filter selection on the classification page
		let filters = {
			"board_size": document.getElementById("board-size-filter").options[document.getElementById("board-size-filter").selectedIndex].text,
			"game_mode": document.getElementById("game-mode-filter").options[document.getElementById("game-mode-filter").selectedIndex].text
		}

		let filtered_match_history = [];
		let id = 0;
		for (let match of this.match_history){
			let board_size_filter_verified = (filters["board_size"] === "All" || match["board_size"] === filters["board_size"]);
			let game_mode_filter_verified = (filters["game_mode"] === "All" || match["game_mode"] === filters["game_mode"]);
			let row = document.getElementById(id.toString() + "-row");
			row.style.display = (board_size_filter_verified && game_mode_filter_verified)? "" : "none";
			id++;
		}
	}

	updateClassificationTable() {
		this.stats.board_size = this.rows.toString() + " X " + this.columns.toString();
		this.stats.match_result = (this.board.winner===1)? "Winner" : "Loser";
		if (this.secondPlayer === 1){
			switch (this.AI_diff) {
				case 0: this.stats.game_mode += "AI (Easy)"; break;
				case 1: this.stats.game_mode += "AI (Medium)"; break;
				case 2: this.stats.game_mode += "AI (Hard)"; break;
				default: break;
			}
		}
		else {this.stats.game_mode += "Player";}
	
		let table = document.getElementById("classifications-table");

		// add new row
		let new_row = table.insertRow(1);
		new_row.id = this.match_history.length.toString() + "-row";
		let j = 0;
		for (let [key, value] of Object.entries(this.stats)) {
			let cell = new_row.insertCell(j);
			cell.textContent = value;
			j++;
		}
		this.match_history.push(this.stats);

		// reset stats
		this.stats = {
			player_name: this.stats.player_name,
			match_result: "",
			board_size: this.rows.toString() + " X " + this.columns.toString(),
			game_mode: "Player X ",
			num_moves: 0,
			num_pieces_eaten: 0,
			score: 0,
		};
	}

	updateStats(parameter, increment=1) {
		if (this.board.player == 1) this.stats[parameter] += increment;
		else if (parameter === "score") this.stats[parameter] += increment;

	}

	setPlayerName() {
		this.stats.player_name = document
			.getElementById("username-input")
			.value.toString();
	}

	// when a player give up
	giveUp(){
		this.board.winner = 3-this.board.player;
		this.showWinner();
		this.showMessage(false);
	}

	// changing board size
	setBoardSize(size) {
		if (size === "0") {
			this.rows = 6;
			this.columns = 5;
		} else if (size === "1") {
			this.rows = 5;
			this.columns = 6;
		} else if (size === "2") {
			this.rows = 6;
			this.columns = 6;
		} else if (size === "3") {
			this.rows = 7;
			this.columns = 6;
		} 
		let board = document.getElementById("board");
		board.style.width = this.columns * 90 + "px";
		board.style.height = this.rows * 90 + "px";
	}

	// changing game mode
	setGameMode(mode) {
		if (mode == 0) { this.secondPlayer = 0; document.getElementById("ai-difficulty").style.display = "none"; }
		else { this.secondPlayer = 1;document.getElementById("ai-difficulty").style.display = "flex"; }
	}
	
	// changing the starting player
	setStartPlayer(player) {
		if (player == 0) { this.startingPlayer = 1; }
		else { this.startingPlayer = 2; }
	}
	
	// changing the AI difficulty
	setAIdiff(diff) {
		if (diff == 0) { this.AI_diff = 0; }
		else if (diff == 1) { this.AI_diff = 1; }
		else { this.AI_diff = 2; }
	}

	// starting a game
	start(){
		this.board = new Board(this.rows,this.columns,this.startingPlayer);
		this.board.createBoardHTML();
		this.board.createSideBoards();
		this.board.updateSideBoards();
		document.getElementById("give-up-button").style.display = "flex";
		document.getElementById("quit-game-button").style.display = "none";
		document.getElementById("winner").innerText = "";
		document.getElementById("AI").innerText = "";
		if (this.secondPlayer == 1 && this.board.player == 2){
			var that = this;
 			setTimeout(function () {that.AI_play();}, 100);
		}
		this.showMessage(false);
	}

	// selecting a piece
	Select(r,c){
		this.selected = true;
		this.rselected = r;
		this.cselected = c;
		let tile = document.getElementById(r.toString() + "-" + c.toString());
		document.getElementById("img-"+tile.id).setAttribute("src", "images/player"+this.board.board[r][c]+"-selected.png");
	}

	// unselecting a piece
	Unselect(r,c){
		this.selected = false;
		let tile = document.getElementById(r.toString() + "-" + c.toString());
		document.getElementById("img-"+tile.id).setAttribute("src", "images/player"+this.board.board[r][c]+".png");
	}

	// showing different messages depending on game state and eventual invalid moves
	showMessage(error){
		let message = document.getElementById("text");
		if (this.board.winner != 0){
			message.innerText = "";
		}
		else if (this.secondPlayer==1 && this.board.player==2){
			message.innerText = "Waiting for AI to play";
		}
		else{
			if (this.board.putPhase){
				let s;
				if (this.board.player == 1){
					s = "Red";
				}
				else{
					s = "Green";
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
						s = "Green";
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
							s = "Green";
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
							s = "Green";
						}
						if (error){message.innerText = s + " player cannot remove that piece";}
						else {message.innerText = s + " player to remove a opponent piece";} 
					}
				}
			}
		}
	}
	
	// displaying who won
	showWinner() {
		if (this.board.winner === 0){ return; }
		this.updateWinRateTable((this.board.winner === 1));
		this.updateClassificationTable();
		let win = document.getElementById("winner");
		win.innerText = (this.board.winner === 1)? "Red Wins" : "Green Wins";
		document.getElementById("give-up-button").style.display = "none";
		document.getElementById("quit-game-button").style.display = "flex";
		document.getElementById("quit-game-button").innerHTML = "BACK&nbsp;&nbsp;&nbsp;TO&nbsp;&nbsp;&nbsp;MENU";
	}

	// showing the move the AI has played
	AI_showMove(move){

		let ai = document.getElementById("AI");
		if (move.length == 1){
			ai.innerText = "AI put a piece at position ("+move[0][0] +", "+move[0][1]+")";
		}
		else if (move.length == 2){
			ai.innerText = "AI moved a piece from position ("+move[0][0] +", "+move[0][1]+") to position ( "+move[1][0] +", "+move[1][1]+")";
		}
		else if (move.length == 3){
			ai.innerText = "AI moved a piece from position ("+move[0][0] +", "+move[0][1]+") to position ( "+move[1][0] +", "+move[1][1]+") and captured the piece at ( "+move[2][0] +", "+move[2][1]+")";
		}
	}

	// AI makes a move
	AI_play(){
		if (this.AI_diff == 0){ // plays random moves
			this.playRandom();
		}
		else if (this.AI_diff === 1){ // playes according to minimax with depth = 3
			this.playMinimax(3);
		}
		else if (this.AI_diff == 2){ // playes according to minimax with depth = 3
			this.playMinimax(5);
		}
		if(!this.board.putPhase){this.updateStats("score", -this.board.heuristic());}
		this.board.updateBoard();
		this.board.updateSideBoards();
		this.showMessage(false);
		this.showWinner();
	}

	// executes a random move
	playRandom(){
		let moves = this.board.everymove();
		let move_to_play = moves[Math.floor(Math.random()*moves.length)];
		this.board = this.board.playMove(move_to_play);
		this.AI_showMove(move_to_play);
	}

	// executes a move according to minimax
	playMinimax(depth){
		if (this.board.winner !== 0){ return ((this.board.winner == 1) ? -1000-depth : 1000+depth); }
		if (depth === 0){ return this.board.heuristic(); }

		// AI is always max, given our heuristic
		let value = -1*Infinity;
		let moves_list = this.board.everymove();
		let move_to_play = moves_list[0];
		let alpha = -1*Infinity;
		let beta = Infinity;
		for (let move of moves_list){
			let child_board = this.board.playMove(move);
			let score = child_board.minimax(depth-1, alpha, beta);
			if (score > value){
				value = score;
				alpha = Math.max(alpha, value);
				move_to_play = move
			}
			if (value >= beta) break;
		}
		this.board = this.board.playMove(move_to_play);
		this.AI_showMove(move_to_play);
	}

	// control flow of the game 
	Click(r,c) {
		if ((this.board.winner != 0) || (this.secondPlayer == 1 && this.board.player == 2) ) {
			return;
		}
		let error = false;
		//Put Phase
		if (this.board.putPhase) {
			if (this.board.CanPut(r, c)) {
				this.board.Put(r,c);
				this.board.updateBoard();
				this.board.updateSideBoards();
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
						if (this.board.CanMove(this.rselected, this.cselected,r,c)) {
							this.board.Move(this.rselected,this.cselected,r,c);
							this.board.updateBoard();
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
						this.board.updateBoard();
						this.board.updateSideBoards();
						this.updateStats("num_pieces_eaten");
						this.updateStats("score", -this.board.heuristic());
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
		document.getElementById("AI").innerText = "";
		if (this.secondPlayer == 1 && this.board.player == 2 && this.board.winner == 0){
			var that = this;
 			setTimeout(function () {that.AI_play();}, 10);
		}
			
	}
}

class Board {
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

	// displaying the board
	createBoardHTML(){
		for (let i=0;i<this.rows;i++){
			for (let j=0;j<this.columns;j++){
				let tile = document.createElement("div");
				tile.id = i.toString() + "-" + j.toString();
				tile.classList.add("tile");
				tile.addEventListener("click", onClick);
				let piece_img = document.createElement("img");
				piece_img.setAttribute("src", "images/player0.png");
				piece_img.setAttribute("id", "img-"+tile.id);
				piece_img.style.width = "100%";
				piece_img.style.height = "100%";
				tile.append(piece_img);
				document.getElementById("board").append(tile);
			}
		}
	}

	// displaying the side boards
	createSideBoards() {
		for (let r = 0; r < 6; r++) {
			let row = [];
			for (let c = 0; c < 2; c++) {
				row.push(0);
				
				let tile_e = document.createElement("div");
				tile_e.id = "E" + r.toString() + "-" + c.toString();
				tile_e.classList.add("tile");
				let piece_img = document.createElement("img");
				piece_img.setAttribute("src", "images/player1.png");
				piece_img.setAttribute("id", "img-"+tile_e.id);
				piece_img.style.width = "100%";
				piece_img.style.height = "100%";
				tile_e.append(piece_img);
				document.getElementById("esquerda").append(tile_e);

				let tile_d = document.createElement("div");
				tile_d.id = "D" + r.toString() + "-" + c.toString();
				tile_d.classList.add("tile");
				piece_img = document.createElement("img");
				piece_img.setAttribute("src", "images/player2.png");
				piece_img.setAttribute("id", "img-"+tile_d.id);
				piece_img.style.width = "100%";
				piece_img.style.height = "100%";
				tile_d.append(piece_img);
				document.getElementById("direita").append(tile_d);
			}
		}
	}

	// updating the display of the board
	updateBoard(){
		for(let r=0;r<this.rows;r++){
			for(let c=0;c<this.columns;c++){
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				document.getElementById("img-"+tile.id).setAttribute("src", "images/player"+this.board[r][c]+".png");
			}
		}
		
			
	}

	// updating the display of the side boards
	updateSideBoards() {
		let count = this.playerPieces[0];
		for (let r = 5; r >= 0; r--) {
			for (let c = 1; c >= 0; c--) {
				let tile = document.getElementById("E" + r.toString() + "-" + c.toString());
				document.getElementById("img-"+tile.id).setAttribute("src", "images/player1.png");
				if (count <= 0){continue;}
				document.getElementById("img-"+tile.id).setAttribute("src", "images/player0.png");
				count--;
			}
		}
		count = this.playerPieces[1];
		for (let r = 5; r >= 0; r--) {
			for (let c = 1; c >= 0; c--) {
				let tile = document.getElementById("D" + r.toString() + "-" + c.toString());
				document.getElementById("img-"+tile.id).setAttribute("src", "images/player2.png");
				if (count <= 0){continue;}
				document.getElementById("img-"+tile.id).setAttribute("src", "images/player0.png");
				count--;
			}
		}
	}

	// removing the board display (because we may start another game with different board size)
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

	// return every possible move for the player
	everymove() {
		let copy = this.copy();
		let moves = [];
		if (copy.putPhase) {
			for (let r = 0; r < copy.rows; r++) {
				for (let c = 0; c < copy.columns; c++) {
					if (copy.CanPut(r, c)) {
						moves.push([[r,c]]);
					}
				}
			}
		} 
		else {
			for (let r = 0; r < copy.rows; r++) {
				for (let c = 0; c < copy.columns; c++) {
					let move = [];
					if (copy.board[r][c] == copy.player) {
						if (r > 0) {
							if (copy.CanMove(r,c,r-1,c)) {
								copy.board[r][c] = 0;
								copy.board[r-1][c] = copy.player;
								if (copy.createsLine(r - 1, c)) {
									for (let r1 = 0; r1 < copy.rows; r1++) {
										for (let c1 = 0; c1 < copy.columns; c1++) {
											if (copy.CanRemove(r1,c1)) {
												moves.push([[r,c],[r-1,c],[r1,c1]]);
											}
										}
									}
								}
								 else {
									moves.push([[r,c],[r-1,c]]);
								}
								copy.board[r][c] = copy.player;
								copy.board[r-1][c] = 0;
							}
						}
						if (r < copy.rows -1) {
							if (copy.CanMove(r,c,r+1,c)) {
								copy.board[r][c] = 0;
								copy.board[r+1][c] = copy.player;
								if (copy.createsLine(r+1, c)) {
									for (let r1 = 0; r1 < copy.rows; r1++) {
										for (let c1 = 0; c1 < copy.columns; c1++) {
											if (copy.CanRemove(r1,c1)) {
												moves.push([[r,c],[r+1,c],[r1,c1]]);
											}
										}
									}
								}
								 else {
									moves.push([[r,c],[r+1,c]]);
								}
								move = [];
								copy.board[r][c] = copy.player;
								copy.board[r+1][c] = 0;
							}
						}
						if (c > 0) {
							if (copy.CanMove(r,c,r,c-1)) {
								copy.board[r][c] = 0;
								copy.board[r][c-1] = copy.player;
								if (copy.createsLine(r, c-1)) {
									for (let r1 = 0; r1 < copy.rows; r1++) {
										for (let c1 = 0; c1 < copy.columns; c1++) {
											if (copy.CanRemove(r1,c1)) {
												moves.push([[r,c],[r,c-1],[r1,c1]]);
											}
										}
									}
								}
								 else {
									moves.push([[r,c],[r,c-1]]);
								}
								move = [];
								copy.board[r][c] = copy.player;
								copy.board[r][c-1] = 0;
							}
						}
						if (c < copy.columns-1) {
							if (copy.CanMove(r,c,r,c+1)) {
								copy.board[r][c] = 0;
								copy.board[r][c+1] = copy.player;
								if (copy.createsLine(r, c+1)) {
									for (let r1 = 0; r1 < copy.rows; r1++) {
										for (let c1 = 0; c1 < copy.columns; c1++) {
											if (copy.CanRemove(r1,c1)) {
												moves.push([[r,c],[r,c+1],[r1,c1]]);
											}
										}
									}
								}
								 else {
									moves.push([[r,c],[r,c+1]]);
								}
								move = [];
								copy.board[r][c] = copy.player;
								copy.board[r][c+1] = 0;
							}
						}
					}
				}
			}
		}
		return moves;
	}

	// creates a copy of the board object
	copy() {
		let b = new Board(this.rows,this.columns, this.player);
		b.putPhase = this.putPhase;
		b.winner = this.winner;
		b.lastmove = copy_3darray(this.lastmove);
		b.playerPieces = this.playerPieces.slice();
		b.board  = copy_2darray(this.board);
		return b;
	}

	// plays the move on the board
	playMove(move){
		let copy = this.copy();
		if (move.length==1){
			copy.Put(move[0][0],move[0][1]);
			copy.changePlayer();
			if (copy.playerPieces[0]+copy.playerPieces[1] == 24){copy.putPhase = false;}
		}
		else if (move.length==2){
			copy.Move(move[0][0],move[0][1],move[1][0],move[1][1]);
			copy.changePlayer();
			copy.checkWinner();
		}
		else if (move.length == 3) {
			copy.Move(move[0][0],move[0][1],move[1][0],move[1][1]);
			copy.Remove(move[2][0],move[2][1]);
			copy.changePlayer();
			copy.checkWinner();
		}
		return copy;
	}

	// return a static evaluation that classifies the board state
	heuristic(){
		if (this.putPhase){
			let pontos = 0;
			let player_tmp = this.player;
			for (let r = 0; r < this.rows; r++){
				for (let c = 0; c < this.columns; c++){
					if (this.board[r][c] == 0){
						this.player = 1;
						if (this.CanPut(r,c)){
							this.board[r][c] = 1;
							if (this.createsLine(r,c)) pontos--;
							this.board[r][c] = 0;
						}
						this.player = 2;
						if (this.CanPut(r,c)){
							this.board[r][c] = 2;
							if (this.createsLine(r,c)) pontos++;
							this.board[r][c] = 0;
						}
					}
				}
			}
			this.player = player_tmp;
			return pontos;
		}
		else{
			return (this.playerPieces[1] - this.playerPieces[0]);
		}
	}

	// returns the best move according to minimax using alpha-beta prunning
	minimax(depth, alpha, beta){
		if (this.winner !== 0){ return ((this.winner == 1) ? -1000-depth : 1000+depth); }
		if (depth === 0){ return this.heuristic(); }

		if (this.player === 1){
			let value = Infinity;
			let moves_list = this.everymove();
			for (let move of moves_list){
				let child_board = this.playMove(move);
				let score = child_board.minimax(depth-1, alpha, beta);
				if (score < value){
					value = score;
					beta = Math.min(beta, value);
				}
				if (value <= alpha) return value;
			}
			return value;
		}

		if (this.player === 2){
			let value = -1*Infinity;
			let moves_list = this.everymove();
			for (let move of moves_list){
				let child_board = this.playMove(move);
				let score = child_board.minimax(depth-1, alpha, beta);
				if (score > value){
					value = score;
					alpha = Math.max(alpha, value);
				}
				if (value >= beta) return value;
			}
			return value;
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

function giveUp(){
	G.giveUp();
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

// controls the navigation between pages
function switchPage(from_id, to_id) {
	let from_doc = document.getElementById(from_id);
	let to_doc = document.getElementById(to_id);

	from_doc.style.display = "none";
	to_doc.style.display = "flex";
}

function showClassificationTable(show_id){
	let tables_ids = ["classifications-table", "win-rate-table"];
	for (let i = 0; i < tables_ids.length; i++){
		if (show_id == tables_ids[i]){ continue; }
		document.getElementById(tables_ids[i]).style.display = "none";
	}
	document.getElementById("board-filter").style.display = (show_id == "classifications-table")? "flex" : "none";
	document.getElementById(show_id).style.display = "table";
}

function filterClassificationTable(){
	G.filterClassificationTable();
}

// returns copy of a 2D array
function copy_2darray(array) {
	let copy = [];
	for (let i = 0; i < array.length; i++) {
		copy[i] = array[i].slice();
	}
	return copy;
}

// returns copy of a 3D array
function copy_3darray(array){
	let copy = [];
	for (let i = 0; i < array.length; i++) {
		let line = [];
		for (let j = 0; j < array[i].length; j++){
			line[j] = array[i][j].slice();
		}
		copy[i] = line;
	}
	return copy;
}
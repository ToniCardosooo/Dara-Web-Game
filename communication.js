//const SERVER = "http://34.67.217.93:8008/";
const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008/";
//const SERVER = "http://localhost:8008/"
const group = 18;
var game = 0;
var game_board = [[]];

async function callServer(request_name, info) {
	console.log(request_name);
	console.log(info);
	return	fetch(SERVER + request_name, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(info)
	})
	.then(response => response.json());

	
}

// DEFINITION FOR THE REGISTER REQUEST METHOD
async function clickRegister() {
	let nick = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;
	let response_json = await callServer("register", { nick, password });
	if (!("error" in response_json)) {
		console.log("Registration successful");
		switchPage('auth-page', 'homepage');
		
	} else {
		console.log("Register failed. Response:");
		console.log(response_json);
	}
}

// DEFINITION FOR THE JOIN REQUEST METHOD
async function lookForGame() {
	let nick = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;
	let rows, columns;
	let size = document.getElementById("board-size-select").value;
	if (size === "0") {
		rows = 6; columns = 5;
	} else if (size === "1") {
		rows = 5; columns = 6;
	} else if (size === "2") {
		rows = 6; columns = 6;
	} else if (size === "3") {
		rows = 7; columns = 6;
	}
	let response_json = await callServer("join", {group, nick, password, "size":{rows, columns}});
	if ("game" in response_json) {
		console.log("Sucessfuly joined a game with ID: "+ response_json.game);
		game = response_json.game;
		switchPage("menu", "wait-game");
		await update();
	}
	else{
		console.log("Join failed. Response:");
		console.log(response_json);
	}
}

// LEAVE REQUEST
async function giveUpRequest(){
	let nick = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;
	let response_json = await callServer("leave", {nick, password, game});
	if (!("error" in response_json)){
		console.log("Successfuly left the game");
		//if (document.getElementById("wait-game").style.display === "flex"){switchPage("wait-game", "menu"); game = null;}
		//else if (document.getElementById("game").style.display === "flex"){switchPage("game", "menu");}
		
	}
	else{
		console.log("Leave failed. Response:");
		console.log(response_json);
	}
}

// NOTIFY REQUEST
async function notify(row, column){
	let nick = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;
	let response_json = await callServer("notify", {nick, password, game, "move":{row,column}});
	if ("error" in response_json){
		console.log("Notify error. Response:");
		console.log(response_json);
		let message = document.getElementById("text");
		message.innerText = response_json.error;
	}
	else{
		console.log("Successfuly notified the server");
	}
}


// UPDATE REQUEST (SSE)
async function update(){
	let nick = document.getElementById("username-input").value;
	let url = SERVER + "update?nick="+nick+"&game="+game;
	const eventSource = new EventSource(url);
	eventSource.onmessage = function(message){
		let json = JSON.parse(message.data);
		console.log(json);
		if ("error" in json){
			console.log("Update error. Response:");
			console.log(json);
			switchPage("wait-game", "menu");
		}
		if ("winner" in json){
			// in case the game is completely done / no forfeit occurs
			if ("board" in json){
				game_board = json.board;
				updateBoardPvP(game_board);
			}
			// update the game message
			console.log("Successfuly received an update from server");
			console.log("Game finished - Winner: " + json.winner);
			eventSource.close();
			let message = document.getElementById("text");
			message.innerText = "Game finished - Winner: " + json.winner;
			document.getElementById("give-up-button").style.display = "none";
			document.getElementById("quit-game-button").style.display = "flex";
			document.getElementById("quit-game-button").innerHTML = "BACK&nbsp;&nbsp;&nbsp;TO&nbsp;&nbsp;&nbsp;MENU";
			// update the ranking table
			// ^^^^^^^^^^^^^^^^^^^^^^^^
		}
		else if ("board" in json){
			game_board = json.board;
			// go to the game page if still at the waiting page
			if (document.getElementById("wait-game").style.display=="flex"){
				console.log("Successfuly received an update from server");
				// create HTML for the board and side boards
				createBoardHTML(game_board);
				createSideBoardsHTML();
				document.getElementById("give-up-button").style.display = "flex";
				document.getElementById("quit-game-button").style.display = "none";
				document.getElementById("winner").innerText = "";
				document.getElementById("AI").innerText = "";
				switchPage("wait-game", "game");
			}
			// change the board and game messages in the browser side
			let phase = json.phase;
			let step = json.step;
			let turn = json.turn;
			updateBoardPvP(game_board);
			updateMessage(phase, step, turn);
		}
	}
}


// RANKING REQUEST
async function ranking(){
	let size = document.getElementById("board-size-filter").options[document.getElementById("board-size-filter").selectedIndex].text;
	let rows, columns;
	if (size === "6 X 5") {
		rows = 6; columns = 5;
	} else if (size === "5 X 6") {
		rows = 5; columns = 6;
	} else if (size === "6 X 6") {
		rows = 6; columns = 6;
	} else if (size === "7 X 6") {
		rows = 7; columns = 6;
	}
	// DEAL WITH ALL, for now if all then show 6 x 5
	else {
		rows = 6; columns = 5;
	}
	let response_json = await callServer("ranking", {group, "size": {rows,columns}});
	if (!("error" in response_json)){
		console.log("Successfuly received the ranking table");
		console.log(response_json);
	}
	else{
		console.log("Ranking error. Response:");
		console.log(response_json);
	}
}


function createBoardHTML(board){
	for (let i = 0; i < board.length; i++){
		for (let j = 0; j < board[0].length; j++){
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

function createSideBoardsHTML() {
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

function updateBoardPvP(board){
	color_value = {"empty":0, "white":1, "black":2};
	piece_count = [0,0];
	// map the values "empty", "white", "black" to 0, 1, 2
	for (let i = 0; i < game_board.length; i++){
		for (let j = 0; j < game_board[0].length; j++){
			game_board[i][j] = color_value[game_board[i][j]];
			if (game_board[i][j] !== 0){ piece_count[game_board[i][j]-1]++; }
		}
	}
	// update the board
	for(let r = 0; r < board.length; r++){
		for(let c = 0; c < board[0].length; c++){
			let tile = document.getElementById(r.toString() + "-" + c.toString());
			document.getElementById("img-"+tile.id).setAttribute("src", "images/player"+board[r][c]+".png");
		}
	}
	// update the side boards
	updateSideBoardsPvP(piece_count[0], piece_count[1]);
}

function updateSideBoardsPvP(p1_count, p2_count) {
	for (let r = 5; r >= 0; r--) {
		for (let c = 1; c >= 0; c--) {
			let tile = document.getElementById("E" + r.toString() + "-" + c.toString());
			document.getElementById("img-"+tile.id).setAttribute("src", "images/player1.png");
			if (p1_count <= 0){continue;}
			document.getElementById("img-"+tile.id).setAttribute("src", "images/player0.png");
			p1_count--;
		}
	}
	for (let r = 5; r >= 0; r--) {
		for (let c = 1; c >= 0; c--) {
			let tile = document.getElementById("D" + r.toString() + "-" + c.toString());
			document.getElementById("img-"+tile.id).setAttribute("src", "images/player2.png");
			if (p2_count <= 0){continue;}
			document.getElementById("img-"+tile.id).setAttribute("src", "images/player0.png");
			p2_count--;
		}
	}
}

function clearPvP() {
	for (let r = 0; r < game_board.length; r++) {
		for (let c = 0; c < game_board[0].length; c++) {
			let tile = document.getElementById(r.toString() + "-" + c.toString());
			if (tile != null) {
				tile.remove();
			}
		}
		console.log(r);
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

function updateMessage(phase, step, turn){
	let message = document.getElementById("text");
	if (phase == "drop"){
		message.innerText = "[Drop Phase] Turn: " + turn;
	}
	else if (step == "from"){
		message.innerText = "[Move Phase - Select Piece] Turn: " + turn;
	}
	else if (step == "to"){
		message.innerText = "[Move Phase - Select Destination] Turn: " + turn;
	}
	else if (step == "take"){
		message.innerText = "[Move Phase - Take Oponent's Piece] Turn: " + turn;
	}
}
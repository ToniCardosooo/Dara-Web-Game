//const SERVER = "http://34.67.217.93:8008/";
const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008/";
//const SERVER = "http://localhost:8008/"
const group = 18;
var game = 0;

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
		//G.Click(row, column);
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
		if ("board" in json){
			if (document.getElementById("wait-game").style.display=="flex"){
				console.log("Successfuly received an update from server");
				switchPage("wait-game", "game");
			}
			let update_board = json.board;
			// change the board in the browser side and message
			color_value = {"empty":0, "white":1, "black":2};
			for (let i = 0; i < G.rows; i++){
				for (let j = 0; j < G.columns; j++){
					G.board.board[i][j] = color_value[update_board[i][j]];
				}
			}
			G.board.updateBoard();
			G.board.updateSideBoards();
			let phase = json.phase;
			let step = json.step;
			let turn = json.turn;
			console.log(step);
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

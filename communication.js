const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008/";
const group = 18;
var game = 0;

async function callServer(request_name, info) {
	console.log(request_name);
	console.log(info);
	return fetch(SERVER + request_name, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(info)
	})
	.then(response => response.json());
}


/* 
async function registerClient(nick, password) {
	let url = SERVER + "register";
	
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ nick: nick, password: password }),
		});
		
		if (response.ok) {
			const json = await response.json();
			console.log("b");
			return !("error" in json);
		}
	} catch (error) {
		console.log("a");
		return false;
	}
}
*/

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
/* 
document
	.getElementById("login-button")
	.addEventListener("click", clickRegister); */


	/* 
	async function joinGame(group, nick, password, size) {
		let url = SERVER + "join";
		
		try {
			const response = await fetch(url, {
				method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ group: group, nick: nick, password: password, size: size }),
		});
		
		if (response.ok) {
			const json = await response.json();
			if ("game" in json) { console.log("Connected to game " + json.game); return true; }
			else if ("error" in json) { console.log("Error: " + json.error); return false; }
		}
		
	} catch (error) { return false; }
	
}
*/

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
		update();
		// abrir SSE do update()
		// mudar para a pagina de espera que tem de ter um botao para desistir de pesquisar
		startGame();
		switchPage("menu","game");
	}
	else{
		console.log("Join failed. Response:");
		console.log(response_json);
	}
}

/* document
	.getElementById("start-game-button")
	.addEventListener("click", clickRegister); */

// LEAVE REQUEST
async function giveUpRequest(){
	let nick = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;
	let response_json = await callServer("leave", {nick, password, game});
	if (!("error" in response_json)){
		console.log("Successfuly left the game");
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
		console.log("Successfuly received an update from server");
		let json = JSON.parse(message.data);
		if (!("winner" in json)){
			let board = json.board;
			let phase = json.phase;
			let step = json.step;
			let turn = json.turn;
		}
		else{
			console.log("The game has ended and player "+ json.winner +" won");
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
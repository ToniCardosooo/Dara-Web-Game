const http = require('http');
const url  = require('url');
var fs = require('fs');
var fsp = require('fs').promises;
const crypto = require('crypto');
var Game_Server = require('./Game_Server.js');


var defaultCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10 // Seconds.
};
var sseHeaders = {    
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Connection': 'keep-alive'
};

let games = {};
let waiting = {};
let update_responses = {};
let game_counter = 1;
let logins;
let notify_timeout;

encrypt = function encrypt(input) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(input);
    return md5Hash.digest('hex');
}

function remember(response,game){
    if (game in update_responses){
        update_responses[game].push(response);
    }
    else{update_responses[game] = [response];}
}

function forget(response, game){
    let pos = update_responses[game].findIndex((resp) => resp === response);
    if (pos>-1){
        update_responses[game].slice(pos,1);
    }
}

function send(body, game){
    for (let response of update_responses[game]){
        response.write('data: '+ JSON.stringify(body) +'\n\n');
    }
}



const server = http.createServer(function (request, response) {
    
    const parsedUrl = url.parse(request.url,true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query; //JSON object
    switch(request.method){
        case 'GET':
            switch(pathname){
                case '/update':
					if (!('nick' in query && 'game' in query)){response.writeHead(400,sseHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                    let nick = query.nick;
                    let game_id_encoded = (query.game);
					let found = false;
					let game_id;
					for (var id in games){
						if (encrypt(id)==game_id_encoded){
							found = true;
							game_id = id;
						}}
					if (!(found)){response.writeHead(400,sseHeaders);response.write(JSON.stringify({"error": "This game is invalid"}));response.end();return;}
                    response.writeHead(200,sseHeaders);
					remember(response,game_id);
                    request.on('close', () =>  {forget(response,game_id)} );
                    setImmediate(() =>{
                        send({},game_id);// isto é o q acontece quando o SSE é iniciado
                    }); 
                	break;

				default: response.writeHead(404,defaultCorsHeaders);response.write(JSON.stringify({'error':'Page not found'}));response.end(); break;
            }
            break;
		
        case 'OPTIONS':
            response.writeHead(200, defaultCorsHeaders);
            response.end();
            break;
        case 'POST' :
            let body = '';
            switch(pathname){ 
                case '/register':
                    request
                        .on('data', (chunk) => {body += chunk;  })
                        .on('end', () => {
                            try { 
                            let dados = JSON.parse(body);
							if (!('nick' in dados && 'password' in dados)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}   
                            let nick = dados.nick;   
                            let password = dados.password
                            /* processar query */ 
                            let encontrei = false;
                            let valido = true;
							fsp.readFile('server/logins.json','utf8')
     							.then( (data) => {
									logins = JSON.parse(data.toString());
                            		for (var nicks in logins){
                                		if (nick === nicks){
                                    		encontrei=true;
                                    		if (logins[nicks]===password){
                                    		}
                                    		else{valido=false;}
                                    		break;
                                		}
                            		}   
									if (nick in logins){
										encontrei=true;
										if (logins[nick]!=password){
											valido=false;
										}
									}
                            		if (!encontrei){
                                		logins[nick]= password;
										try {
											fsp.writeFile('server/logins.json',JSON.stringify(logins))
										}
										catch (err){console.log("ERRO: "+err);}
											
		                          	}							                           		
                            		if (valido){
										response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
										response.write(JSON.stringify({}));
									}
                        	    	else {
										response.writeHead(401, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
										response.write(JSON.stringify({"error": "User registered with a different password"}));}
                            		response.end();
                        			return;
								})
								.catch((err) => console.log("ERRO: "+err));								
                        }
                            catch(err) {  console.log(err); }
                        })
                        .on('error', (err) => { console.log(err.message); });
                    break;
                case "/ranking":
                    request
                        .on('data', (chunk) => {body += chunk;  })
                        .on('end', () =>{
                            try{
                                let dados = JSON.parse(body);
								if (!('size' in dados)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}  
                                let size = dados.size;
								if (!('rows' in size && 'columns' in size)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                                let rows = size.rows;
                                let columns = size.columns;
                                let size_string = JSON.stringify(size);	
								if (!((rows==6 && columns==5)||(rows==5 && columns==6)||(rows==6 && columns==6)||(rows==7 && columns==6))){
									response.writeHead(400, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
									response.write(JSON.stringify({'error': 'Invalid size'}));
									response.end();
									return;
								}					
								fsp.readFile('server/rankings.json','utf8')
     							.then( (data) => {
									rankings = JSON.parse(data.toString());
									rankings[size_string]['ranking'].sort(function(a, b){return b['victories'] - a['victories']});
									let max = Math.min(10,rankings[size_string]['ranking'].length);
									let list = rankings[size_string]['ranking'].slice(0,max);
									try {
										fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
									}
									catch (err){console.log("ERRO: "+err);}
									response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
									response.write(JSON.stringify({'ranking':list}));
									response.end();
								})
								.catch((err) => console.log("ERRO: "+err));								
                            }
                            catch(err){console.log(err);}
                        })
                        break;
                case "/join":
                    request
                        .on('data', (chunk) => {body += chunk;  })
                        .on('end', () => {
                            try { 
                                let dados = JSON.parse(body);
								if (!('nick' in dados && 'password' in dados && 'size' in dados)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;} 
                                let nick = dados.nick;
                                let password = dados.password;
                                let size = dados.size;
								if (!('rows' in size && 'columns' in size)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                                let rows = size.rows;
                                let columns = size.columns;
                                let size_string = JSON.stringify(size);
								if (!(nick in logins)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User does not exist"}));
									response.end();
									return;
								}
								if (!(logins[nick]==password)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User registered with a different password"}));
									response.end();
									return;}
                                if (!((rows==6 && columns==5)||(rows==5 && columns==6)||(rows==6 && columns==6)||(rows==7 && columns==6))){
									response.writeHead(400, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
									response.write(JSON.stringify({'error': 'Invalid size'}));
									response.end();
									return;
								}	
								if ((size_string in waiting)){
                                    if (waiting[size_string].length > 0){
                                        let waiter = waiting[size_string].pop();
                                        let game_id = waiter.game;
                                        let player_1 = waiter.nick;
                                        let encoded_game_id = encrypt(game_id);
                                        //cria um jogo com player_1 e nick e manda para ambos os players, e começa o, adicionando ao dicionario games um par game_id: game_object
                                        response.writeHead(200,defaultCorsHeaders);
                                        response.write(JSON.stringify({'game':encoded_game_id}));
                                        response.end();
                                        let game = games[game_id];
										notify_timeout = setTimeout(()=>{
										let loser;
										if (game.board.player==1){loser=game.player_1;}
										if (game.board.player==2){loser=game.player_2;}
										game.giveUp(loser);
										let winner;
										if(game.board.winner==1){winner = game.player_1;}
										else{winner = game.player_2;}
										let player_1 = game.player_1;
										let player_2 = game.player_2;
										let size_string = game.size;
										fsp.readFile('server/rankings.json','utf8')
										 .then( (data) => {
											rankings=JSON.parse(data.toString());
											for (var player of rankings[size_string]['ranking']){
												if (player['nick']==winner){player['victories']++;}
												if (player['nick']==player_1){player['games']++;}
												if (player['nick']==player_2){player['games']++;}
											}
											try {
												fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
											}
											catch (err){console.log("ERRO: "+err);}
										})
										.catch((err) => console.log("ERRO: "+err));									
										setTimeout(()=>{send(game.object_to_update(), game_id);},500);
										delete games[game_id];
										},120000);
                                        game.join_player_2(nick);
                                        setTimeout(() => send(game.object_to_update(),game_id), 1000); // se for tudo seguido, ele n tem tempo de iniciar o sse e receber o 1º update, assim, ele entra, recebe q o jogo começou, epsra 1 segundo(provavelmente pudemos diminuir isso) e só depois é q recebe o 1º update
										fsp.readFile('server/rankings.json','utf8')
     										.then( (data) => {
												rankings = JSON.parse(data.toString());
												let found_1 = false;
												let found_2 = false;
												for (player of rankings[size_string]['ranking']){
													if (player['nick'] == player_1){found_1=true;}
													if (player['nick'] == nick){found_2=true;} 
												}
												if (!found_1){rankings[size_string]['ranking'].push({'nick':player_1,'victories':0,'games':0});}
												if (!found_2){rankings[size_string]['ranking'].push({'nick':nick,'victories':0,'games':0});}
												try {
													fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
												}
												catch (err){console.log("ERRO: "+err);}
												return;
											})
											.catch((err) => console.log("ERRO: "+err));										
                                    }
                                    else{
                                        let game_id = 'game_number_'+game_counter;
                                        game_counter++;
                                        waiting[size_string].push({'game':game_id, 'nick':nick});
                                        let encoded_game_id = encrypt(game_id);
                                        let new_game = new Game_Server(size_string,rows,columns,game_id,nick);
                                        games[game_id] = new_game;
                                        response.writeHead(200,defaultCorsHeaders);
                                        response.write(JSON.stringify({'game':encoded_game_id}));
                                        response.end();
                                        return;
                                        }
                                }
                                else{
                                    let game_id = 'game_number_'+game_counter;
                                    game_counter++;
                                    waiting[size_string] = [{'game':game_id, 'nick':nick}];
                                    let encoded_game_id = encrypt(game_id);
                                    let new_game = new Game_Server(size_string,rows,columns,game_id,nick);
                                    games[game_id] = new_game;
                                    response.writeHead(200,defaultCorsHeaders);
                                    response.write(JSON.stringify({'game':encoded_game_id}));
                                    response.end();
                                    return;}
                            }
                            catch(err){console.log(err);}
                        })
                    break;
                case "/leave":
                    request
                        .on('data', (chunk) => {body += chunk;  })
                        .on('end', () => {
                            try{
                                let dados = JSON.parse(body); 
								if (!('nick' in dados && 'password' in dados && 'game' in dados)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                                let nick = dados.nick;
                                let password = dados.password;
                                let game_id_encoded = dados.game;
								let found = false;
								let game_id;
								for (var id in games){
									if (encrypt(id)==game_id_encoded){
										found=true;
										game_id = id;
									}
								}
								if (!(nick in logins)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User does not exist"}));
									response.end();
									return;
								}
								if (!(logins[nick]==password)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User registered with a different password"}));
									response.end();
									return;}
                                if (!(found)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "This game is invalid"}));response.end();return;}                    
                                response.writeHead(200,defaultCorsHeaders);
                                response.write(JSON.stringify({}));
                                response.end();
                                let game = games[game_id];
                                if (waiting[game.size].length>0){ // caso saia durante a procura de jogo
                                    if (waiting[game.size][0].nick == nick){
                                        waiting[game.size].pop();
                                        send({'winner':null}, game_id);
										delete games[game_id];
                                        return;
                                    }
                                }
                                game.giveUp(nick);
								let winner;
								if(nick==game.player_1){winner = game.player_2;}
								else{winner = game.player_1;}
								let player_1 = game.player_1;
								let player_2 = game.player_2;
								let size_string = game.size;
								fsp.readFile('server/rankings.json','utf8')
     							.then( (data) => {
									rankings=JSON.parse(data.toString());
									for (var player of rankings[size_string]['ranking']){
										if (player['nick']==winner){player['victories']++;}
										if (player['nick']==player_1){player['games']++;}
										if (player['nick']==player_2){player['games']++;}
									}
									try {
										fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
									}
									catch (err){console.log("ERRO: "+err);}
								})
								.catch((err) => console.log("ERRO: "+err));									
                                send(game.object_to_update(), game_id);
								delete games[game_id];
                                return;
                            }
                            catch(err){console.log(err);}
                        })
                    break;
                case "/notify":
                    request
                        .on('data', (chunk) => {body += chunk;  })
                        .on('end', () => {
                            try{
								if (notify_timeout){clearTimeout(notify_timeout);}
                                let dados = JSON.parse(body); 
								if (!('nick' in dados && 'password' in dados && 'game' in dados && 'move' in dados)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                                let nick = dados.nick;
                                let password = dados.password;
                                let game_id_encoded = dados.game;
								let found = false;
								let game_id;
								for (var id in games){
									if (encrypt(id)==game_id_encoded){
										found=true;
										game_id = id;
									}
								}
                                let move = dados.move;
								if (!('row' in move && 'column' in move)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "Missing arguments"}));response.end();return;}
                                let row = parseInt(move.row);
                                let column = parseInt(move.column);
								if (!(nick in logins)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User does not exist"}));
									response.end();
									return;
								}
								if (!(logins[nick]==password)){
									response.writeHead(401,defaultCorsHeaders);
									response.write(JSON.stringify({"error": "User registered with a different password"}));
									response.end();
									return;}
                                if (!(found)){response.writeHead(400,defaultCorsHeaders);response.write(JSON.stringify({"error": "This game is invalid"}));response.end();return;}
                                let game = games[game_id];
								notify_timeout = setTimeout(()=>{
								let loser;
								if (game.board.player==1){loser=game.player_1;}
								if (game.board.player==2){loser=game.player_2;}
								game.giveUp(loser);
								let winner;
								if(game.board.winner==1){winner = game.player_1;}
								else{winner = game.player_2;}
								let player_1 = game.player_1;
								let player_2 = game.player_2;
								let size_string = game.size;
								fsp.readFile('server/rankings.json','utf8')
     							.then( (data) => {
									rankings=JSON.parse(data.toString());
									for (var player of rankings[size_string]['ranking']){
										if (player['nick']==winner){player['victories']++;}
										if (player['nick']==player_1){player['games']++;}
										if (player['nick']==player_2){player['games']++;}
									}
									try {
										fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
									}
									catch (err){console.log("ERRO: "+err);}
								})
								.catch((err) => console.log("ERRO: "+err));		
								setTimeout(()=>{send(game.object_to_update(), game_id);},500);							 
								delete games[game_id];
								},120000);
								if(!(game_id in games)){return;}
                                let error = game.canDothis(row,column,nick);
                                if (error!='valid'){
                                    //manda uma mensagem com o erro
                                    response.writeHead(400,defaultCorsHeaders);
                                    response.write(JSON.stringify({'error':error}));
                                    response.end();
                                    return;
                                }
                                game.Dothis(row,column,nick);
                                response.writeHead(200,defaultCorsHeaders);
                                response.write(JSON.stringify({}));
                                response.end();
								let to_send = games[game_id].object_to_update();
								to_send['move']={'row':row,'column':column};
                                send(to_send, game_id);
								if (games[game_id].board.winner != 0){
									let winner;
									if(game.winner==1){winner = game.player_1;}
									else{winner = game.player_2;}
									let player_1 = game.player_1;
									let player_2 = game.player_2;
									let size_string = game.size;
									fsp.readFile('server/rankings.json','utf8')
     									.then( (data) => {
											rankings=JSON.parse(data.toString());											
											for (var player of rankings[size_string]['ranking']){											
												if (player['nick']==winner){player['victories']++;}
												if (player['nick']==player_1){player['games']++;}
												if (player['nick']==player_2){player['games']++;}
											}
											try {
												fsp.writeFile('server/rankings.json',JSON.stringify(rankings))
											}
											catch (err){console.log("ERRO: "+err);}
								})
								.catch((err) => console.log("ERRO: "+err));									
								delete games[game_id];
								}
                                return;
                            }
                            catch(err){console.log(err);}
                        })
                    break;
				
				default: response.writeHead(404,defaultCorsHeaders);response.write(JSON.stringify({'error':'Page not found'}));response.end(); break;
            }
            break;
		
		default: response.writeHead(404,defaultCorsHeaders);response.write(JSON.stringify({'error':'Page not found'}));response.end(); break;
            
    }
});

server.listen(8008);
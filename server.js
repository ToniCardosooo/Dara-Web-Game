
const http = require('http');
const url = require('url');
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
let logins = {};
let rankings = {};
let games = {};
let waiting = {};
let update_responses = {};

function remember(response, game) {
    if (game in update_responses) {
        update_responses[game].push(response);
    }
    else { update_responses[game] = [response]; }
}

function forget(response, game) {
    let pos = update_responses[game].findIndex((resp) => resp === response);
    if (pos > -1) {
        update_responses[game].slice(pos, 1);
    }
}

function send(body, game) {
    console.log(body);
    for (let response of update_responses[game]) {
        response.write('data: ' + JSON.stringify(body) + '\n\n');
    }
}



const server = http.createServer(function (request, response) {

    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query; //JSON object
    //response.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    //response.write('Método: '+request.method+'\n');
    //response.write('URL: '+request.url+'\n');
    //response.write(String(pathname)+'\n')
    //response.write(JSON.stringify(query)+'\n')
    //response.end();

    console.log(request.method);
    console.log(pathname);
    switch (request.method) {
        case 'GET':
            response.writeHead(200, sseHeaders);
            switch (pathname) {
                case '/update':
                    let nick = query.nick;
                    let game = query.game;
                    remember(response, game);
                    request.on('close', () => { console.log("fechei o SSE"); forget(response, game) });
                    setImmediate(() => {
                        send({ "counter": update_responses[game].length }, game);//obviamente mudar isto, isto é o q acontece quando o SSE é iniciado, eventualmente não é preciso ter código aqui
                    });
                    break;
            }
            break;
        case 'OPTIONS':
            response.writeHead(200, defaultCorsHeaders);
            response.end();
            break;
        case 'POST':
            let body = '';
            switch (pathname) {
                case '/register':
                    request
                        .on('data', (chunk) => { body += chunk; })
                        .on('end', () => {
                            try {
                                let dados = JSON.parse(body);
                                let nick = dados.nick;
                                let password = dados.password
                                console.log(nick);
                                console.log(password);
                                /* processar query */
                                let encontrei = false;
                                let valido = true;
                                for (var nicks in logins) {
                                    if (nick === nicks) {
                                        encontrei = true;
                                        if (logins[nicks] === password) {
                                        }
                                        else { valido = false; }
                                        break;
                                    }
                                }
                                if (!encontrei) {
                                    logins[nick] = password;
                                }

                                response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
                                if (valido) response.write(JSON.stringify({}));
                                else { response.write(JSON.stringify({ "error": "User registered with a different password" })); }
                                response.end();
                                return;
                            }
                            catch (err) { console.log(err); }
                        })
                        .on('error', (err) => { console.log(err.message); });
                    break;
                case "/ranking":
                    request
                        .on('data', (chunk) => { body += chunk; })
                        .on('end', () => {
                            try {
                                let dados = JSON.parse(body);
                                let size = dados.size;
                                let rows = size.rows;
                                let columns = size.columns;
                                console.log(rows);
                                console.log(columns);
                                console.log(size);
                            }
                            catch (err) { console.log(err); }
                        })
                    break;
                case "/join":
                    request
                        .on('data', (chunk) => { body += chunk; })
                        .on('end', () => {
                            try {
                                let dados = JSON.parse(body);
                                let nick = dados.nick;
                                let password = dados.password;
                                let size = dados.size;
                                let rows = size.rows;
                                let columns = size.columns;
                                let size_string = JSON.stringify(size);
                                if (logins[nick] != password) { response.writeHead(200, defaultCorsHeaders); response.write(JSON.stringify({ "error": "User registered with a different password" })); response.end(); return; }
                                if ((size_string in waiting)) {
                                    if (waiting[size_string].length > 0) {
                                        let player_1 = waiting[size_string].pop();
                                        //cria um jogo com player_1 e nick e manda para ambos os players, e começa o, adicionando ao dicionario games um par game_id: game_object
                                        console.log("criei um jogo com os players " + player_1 + " e " + nick);
                                        response.writeHead(200, defaultCorsHeaders);
                                        response.write(JSON.stringify({ 'game': 'ola' }));
                                        response.end();
                                        setTimeout(() => send({ 'message': 'comecou o jogo', 'board': 'oi' }, 'ola'), 1000); // se for tudo seguido, ele n tem tempo de iniciar o sse e receber o 1º update, assim, ele entra, recebe q o jogo começou, epsra 1 segundo(provavelmente pudemos diminuir isso) e só depois é q recebe o 1º update
                                        // obviamente mudar isto em cima
                                        return;
                                    }
                                    else { waiting[size_string].push(nick); console.log("fila de espera");/*definir game_id e apagar push(nick); waiting[size].push(game_id);response.write(JSON.stringify({'game':game_id})); response.end();return;*/ }
                                }
                                else { waiting[size_string] = [nick]; console.log("fila de espera");/*definir game_id e apagar push(nick); waiting[size].push(game_id);response.write(JSON.stringify({'game':game_id})); response.end();return;*/ }
                                response.writeHead(200, defaultCorsHeaders);
                                response.write(JSON.stringify({ 'game': 'ola' }));
                                response.end();
                                return;
                            }
                            catch (err) { console.log(err); }
                        })
                    break;
                case "/leave":
                    request
                        .on('data', (chunk) => { body += chunk; })
                        .on('end', () => {
                            try {
                                let dados = JSON.parse(body);
                                let nick = dados.nick;
                                let password = dados.password;
                                let game = dados.game;
                                if (logins[nick] != password) { response.writeHead(200, defaultCorsHeaders); response.write(JSON.stringify({ "error": "User registered with a different password" })); response.end(); return; }
                                if (!(game in games)) { response.writeHead(200, defaultCorsHeaders); response.write(JSON.stringify({ "error": "This game is invalid" })); response.end(); return; }
                                //terminar o jogo, whatever that means
                                response.writeHead(200, defaultCorsHeaders);
                                response.write(JSON.stringify({}));
                                response.end();
                                send({ nick: nick, 'status': "game over", 'winner': nick, 'board': "ola" }, game);//obviamente mudar isto
                                return;
                            }
                            catch (err) { console.log(err); }
                        })
                    break;
                case "/notify":
                    request
                        .on('data', (chunk) => { body += chunk; })
                        .on('end', () => {
                            try {
                                let dados = JSON.parse(body);
                                let nick = dados.nick;
                                let password = dados.password;
                                let game = dados.game;
                                let move = dados.move;
                                let row = move.row;
                                let column = move.column;
                                if (logins[nick] != password) { response.writeHead(200, defaultCorsHeaders); response.write(JSON.stringify({ "error": "User registered with a different password" })); response.end(); return; }
                                if (!(game in games)) { response.writeHead(200, defaultCorsHeaders); response.write(JSON.stringify({ "error": "This game is invalid" })); response.end(); return; }
                                //vê se é valido
                                // joga
                                //manda update para os 2 players
                                response.writeHead(200, defaultCorsHeaders);
                                response.write(JSON.stringify({}));
                                response.end();
                                send({ 'move': move, 'player': nick, 'board': 'oi' }, game);//obviamente mudar isto
                                return;
                            }
                            catch (err) { console.log(err); }
                        })
                    break;
            }
            break;

    }
});

server.listen(8008);
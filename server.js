
const http = require('http');
const url  = require('url');
var defaultCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10 // Seconds.
};
let logins = {};
let rankings = {};
let games = {};
let waiting = {};

const server = http.createServer(function (request, response) {
    
    const parsedUrl = url.parse(request.url,true);
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
    switch(request.method){
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
                            let nick = dados.nick;   
                            let password = dados.password
                            console.log(nick);
                            console.log(password);
                            /* processar query */ 
                            let encontrei = false;
                            let valido = true;
                            for (var nicks in logins){
                                if (nick === nicks){
                                    encontrei=true;
                                    if (logins[nicks]===password){
                                    }
                                    else{valido=false;}
                                    break;
                                }
                            }   
                            if (!encontrei){
                                logins[nick]= password;
                            }
                            
                            response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
                            if (valido)response.write(JSON.stringify({}));
                            else {response.write(JSON.stringify({"error": "User registered with a different password"}));}
                            response.end();
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
                                let size = dados.size;
                                let rows = size.rows;
                                let columns = size.columns;
                                console.log(rows);
                                console.log(columns);
                                console.log(size);
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
                                let nick = dados.nick;
                                let password = dados.password;
                                let size = dados.size;
                                let rows = size.rows;
                                let columns = size.columns;
                                if (logins[nick]!=password){response.write(JSON.stringify({"error": "User registered with a different password"}));response.end();}
                                if ((size in waiting)){
                                    if (waiting[size].length > 0){
                                        let player_1 = waiting[size].pop();
                                        //cria um jogo com player_1 e nick e manda para ambos os players, e começa o
                                        console.log("criei um jogo com os players "+player_1+" e "+nick);
                                    }
                                    else{waiting[size].push(nick); console.log("fila de espera");}
                                }
                                else{waiting[size] = [nick]; console.log("fila de espera");}
                            }
                            catch(err){console.log(err);}
                        })
                    break;
                case "/leave":
                    break;
                case "/notify":
                    break;
            }
            break;
            
    }
});

server.listen(8008);
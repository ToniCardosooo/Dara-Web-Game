
const http = require('http');
const url  = require('url');

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
    let answer = {"ola":"ola"};
    switch(pathname){
        case '/register' :
            let body = ''; 
            let dados
            request
                .on('data', (chunk) => { body += chunk;  })
                .on('end', () => {
                    try { dados = JSON.parse(body);      
                        
                        /* processar query */ 
                        console.log(JSON.stringify(dados))
                        response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Access-Control-Allow-Origin': '*'});
                        response.end(JSON.stringify(dados));
                    }
                    catch(err) {  console.log(err); }
                })
                .on('error', (err) => { console.log(err.message); });
            //console.log(body)
            //console.log(dados)
            break;
    }
});

server.listen(8008);
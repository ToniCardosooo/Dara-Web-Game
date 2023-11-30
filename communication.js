const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008/"



function register_client(nick, password){
    let url = SERVER + "register/";
    let can_register = fetch(url,{
        method: 'POST',
        headers: {
            'Access-Control-Allow-Origin' : '*'
            //'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: JSON.stringify({ 'nick': nick, 'password': password})
    })
    .then(function(response) {
        if (response.ok){
            return response.json();
        }
    })
    .then(function(json){
        if ( "error" in json){
            return false;
        }
        else {
            return true;
        }
    })
    return can_register;
}

function click_register_client(){
    let nick = document.getElementById("username-input").value;
    let password = document.getElementById("password-input").value;
    let can_login = register_client(nick,password);
    console.log(can_login);
}
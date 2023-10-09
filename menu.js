var menu = document.getElementById("menu");
var game = document.getElementById("game");
var showing_menu = true;

function switchToGame(){
    if (showing_menu){
        menu.style.display = "none";
        game.style.display = "block";
    }
}

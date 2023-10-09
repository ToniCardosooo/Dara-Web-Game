var homepage = document.getElementById("homepage");
var menu = document.getElementById("menu");
var showing_homepage = true;

function switchToMenu(){
    if (showing_homepage){
        homepage.style.display = "none";
        menu.style.display = "block";
    }
}

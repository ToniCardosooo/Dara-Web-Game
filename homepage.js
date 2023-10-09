

window.onload = function() {
    let toggle = button => {
        let homepage = document.getElementById("homepage");
        let game = document.getElementById("game");

        if (game.getAttribute("hidden")) {
            game.removeAttribute("hidden");
            homepage.setAttribute("hidden", "hidden");
        } 
    }

    document.getElementById("play-button").onclick = toggle;
}
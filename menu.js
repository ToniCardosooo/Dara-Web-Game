
function customBoardSize(){
    let board_size_select = document.getElementById("board-size-select");
    let custom_size_div = document.getElementById("custom-board-size");
    if (board_size_select.options[board_size_select.selectedIndex].text == "Custom"){
        custom_size_div.style.display = "flex";
    }
    else{custom_size_div.style.display = "none";}
}

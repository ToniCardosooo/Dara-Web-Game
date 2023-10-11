
function switchPage(from_id, to_id){
    let from_doc = document.getElementById(from_id);
    let to_doc = document.getElementById(to_id);

    from_doc.style.display = "none";
    to_doc.style.display = "flex"

    /* 
    Remember to erase the board's content if we're
    quitting the board with this function 
    */
}
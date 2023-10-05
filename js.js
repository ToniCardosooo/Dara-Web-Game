var playerRed = 1;
var playerYellow = 2;
var currPlayer = playerRed;
var putPhase = true
var pieceCount = 12;
var gameOver = false;
var board;
var selected = false;
var rselected;
var cselected;
var remove=false;
var lastmove=[-1,-1,-1,-1,-1,-1,-1,-1];

var rows = 6;
var columns = 5;

window.onload = function() {
    setGame();
}

function setGame() {
    board = [];


    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            // JS
            row.push(' ');
            // HTML
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.addEventListener("click", onClick);
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }
}

function updateBoard(){
    for (let r=0; r<rows; r++){
        for (let c=0; c<columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            if (board[r][c]==1){tile.classList.remove("yellow-piece");tile.classList.add("red-piece");}
            if (board[r][c]==2){tile.classList.remove("red-piece");tile.classList.add("yellow-piece");}
            if (board[r][c]==0) {tile.classList.remove("red-piece");tile.classList.remove("yellow-piece");}
        }
    }
}

function onClick() {
    //if (gameOver) {
    //    return;
    //}

    //get coords of that tile clicked
    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);


    //Put Phase
    if (putPhase){
       if (CanPut(r,c,currPlayer)){
        board[r][c]=currPlayer;
        currPlayer=3-currPlayer;
        updateBoard();
        pieceCount--
        if (pieceCount<=0){putPhase=false;}
    } 
    }
    
    //Move Phase
    else{
        if (!selected){
           if (canPick(r,c,currPlayer)){
            selected=true;
            rselected=r;
            cselected=c;
            board[r][c]=0;
            updateBoard();
            } 
        }
        else{
            if (remove && board[r][c]==3-currPlayer){
                board[r][c]=0;
                currPlayer=3-currPlayer;
                selected=false;
                remove=false;
                updateBoard(); 
            }
            
            else{
                if (r==rselected && c==cselected){selected=false;board[r][c]=currPlayer;updateBoard();}
                else if (CanPut(r,c,currPlayer) && CanMove(r,c,rselected,cselected) && !Repeat(lastmove,r,c,rselected,cselected,currPlayer)){
                    board[r][c]=currPlayer;
                    board[rselected][cselected]=0;
                    lastmove[(currPlayer-1)*4]=r;
                    lastmove[(currPlayer-1)*4+1]=c;
                    lastmove[(currPlayer-1)*4+2]=rselected;
                    lastmove[(currPlayer-1)*4+3]=cselected;
                    updateBoard(); 
                    if (createsLine(r,c,currPlayer)){remove=true}
                    else{currPlayer=3-currPlayer;selected=false}
                     
                }
            }
            
        }
        
    }
    
    //checkWinner();
}

function CanPut(r,c,currPlayer){

    //Check is Empty
    if (board[r][c] != 0){
        return false
    }

    board[r][c] = currPlayer;
    
    //Check Horizontal
    let min = Math.max(0,c-3)
    let max = Math.min(1,c)
    
    for (let i=min;i<=max;i++){
        if (currPlayer == board[r][i] && board[r][i] == board[r][i+1] && board[r][i+1] == board[r][i+2] && board[r][i+2] == board[r][i+3]){
            board[r][c] = 0;
            return false
        }
    }
        
    // Check Vertical
    min = Math.max(0,r-3)
    max = Math.min(2,r)

    for (let i=min;i<=max;i++){
        if (currPlayer == board[i][c] && board[i][c] == board[i+1][c] && board[i+1][c] == board[i+2][c] && board[i+2][c] == board[i+3][c]){
            board[r][c] = 0;
            return false
        }
    }
    board[r][c] = 0;
    return true
}

//
function canPick(r,c,currPlayer){
    return board[r][c] == currPlayer
}

function CanMove(r,c,rselected,cselected){
    if (r==rselected && Math.abs(c-cselected)==1){return true}
    if (c==cselected && Math.abs(r-rselected)==1){return true}
    return false
}
function createsLine(r,c,currPlayer){
    
    //Check Horizontal
    let min = Math.max(0,c-2)
    let max = Math.min(2,c)
    
    for (let i=min;i<=max;i++){
        if (currPlayer == board[r][i] && board[r][i] == board[r][i+1] && board[r][i+1] == board[r][i+2]){
            return true
        }
    }
        
    // Check Vertical
    min = Math.max(0,r-2)
    max = Math.min(3,r)

    for (let i=min;i<=max;i++){
        if (currPlayer == board[i][c] && board[i][c] == board[i+1][c] && board[i+1][c] == board[i+2][c]){
            return true
        }
    }
    return false
}

function Repeat(lastmove,r,c,rselected,cselected,currPlayer){
    return lastmove[(currPlayer-1)*4]==rselected && lastmove[(currPlayer-1)*4+1]==cselected && lastmove[(currPlayer-1)*4+2]==r && lastmove[(currPlayer-1)*4+3]==c;
}

function checkWinner() {

}

function setWinner(r, c) {
    let winner = document.getElementById("winner");
    if (board[r][c] == playerRed) {
        winner.innerText = "Red Wins";             
    } else {
        winner.innerText = "Yellow Wins";
    }
    gameOver = true;
}
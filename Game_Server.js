var imports = require('./Board_Server.js');


module.exports = class Game_Server{
	constructor(size,rows,columns,game_id,player_1_nick,player_2_nick){
        this.size = size;
        this.game_id = game_id;
        this.players = {'player 1': player_1_nick};
        this.player_colors = {[player_1_nick]:'white'};
        this.player_1 = player_1_nick;
        this.player_2 = 0;
		this.rows = rows;
		this.columns = columns;
		this.startingPlayer=1;
		//this.secondPlayer = 0;// =0 if Player X Player, =1 if Player X AI
		//this.AI_diff = 0;// =0 if "easy", =1 if "medium", =2 if "hard"
		this.selected = false; // is a piece selected to move
		this.remove = false; // can remove a opponent piece
		this.rselected;
		this.cselected;
        this.board = new imports.Board_Server(this.rows,this.columns,this.startingPlayer);
	}

	canDothis(row, column, nick) {
		let player;
    	if (this.players['player 1'] == nick){player=1;}
    	else{player = 2;}
		if (player!=this.board.player){return 'Not your turn to play';}
		if (row<0 || row>=this.rows || column<0 || column>=this.columns || !Number.isInteger(row) || !Number.isInteger(column)){return 'Invalid position';}
    	if (this.board.putPhase){
			if (this.board.board[row][column]!=0)return 'Invalid move: non empty cell';
			if (this.board.CanPut(row,column)){return 'valid';}
			return 'Invalid move: more than 3 inline pieces';
		}
		if (!this.selected){
			if (this.board.canPick(row,column)){return 'valid';}
			return 'Not your piece';
		}
		if (!this.remove){
			if (row == this.rselected && column==this.cselected){return 'valid';}
			if (this.board.board[row][column]!=0)return 'Invalid move: non empty cell';
			if (this.board.Repeat(this.rselected,this.cselected,row,column)){return 'Invalid move: cannot return immediastly to this cell';}
			if (this.board.CanMove(this.rselected, this.cselected, row, column)){return 'valid';}
			return 'Invalid move: can only move to neigbouring cells, vertically or horizontally';
		}
		if (this.board.board[row][column]!=3-player)return 'No opponent piece to take';
		return 'valid';
	}

    Dothis(row,column,nick){
		if(this.board.putPhase){this.board.Put(row,column);this.board.changePlayer();return;}
		if(!this.selected){this.Select(row,column);return;}
		if(!this.remove){
			if(row == this.rselected && column==this.cselected){this.Unselect(row,column);return;}
			this.board.Move(this.rselected,this.cselected,row,column);
			if (this.board.createsLine(row, column))this.remove=true;
			else{this.board.changePlayer();
				this.selected = false;
				this.board.checkWinner();
			}
			return;
		}
		this.board.Remove(row,column);
		this.board.changePlayer();
		this.selected = false;
		this.remove = false;
		this.board.checkWinner();
    }

    join_player_2(nick){
        this.players['player 2']=nick;
        this.player_colors[[nick]]='black';
        this.player_2 = nick;
    }

    object_to_update(){
        let json = {};
        if (this.board.winner!=0){
            json['winner'] = this.players['player '+this.board.winner];
            let board_json = imports.copy_2darray(this.board.board);
            for (let i=0;i<this.rows;i++){
                for(let j=0;j<this.columns;j++){
                    if (board_json[i][j] == 0){board_json[i][j] = 'empty';}
                    else if (board_json[i][j] == 1){board_json[i][j] = 'white';}
                    else if (board_json[i][j] == 2){board_json[i][j] = 'black';}
                }
            }
            json['board'] = board_json;
            return json;}
        json['turn'] = this.players['player '+this.board.player];
        if (this.board.putPhase){json['phase']='drop';}
        else{json['phase']='move';}
        if (this.selected){
            if (this.remove){json['step']='take';}
            else{json['step']='to';}
        }
        else{json['step']='from';}
        json['players'] = this.player_colors;
        let board_json = imports.copy_2darray(this.board.board);
        for (let i=0;i<this.rows;i++){
            for(let j=0;j<this.columns;j++){
                if (board_json[i][j] == 0){board_json[i][j] = 'empty';}
                else if (board_json[i][j] == 1){board_json[i][j] = 'white';}
                else if (board_json[i][j] == 2){board_json[i][j] = 'black';}
            }
        }
        json['board'] = board_json;
        return json;
    }




	// when a player give up
	giveUp(nick){
        let player;
		if (this.players['player 1'] == nick){player=1;}
        else{player = 2;}
		this.board.winner = 3-player;
	}






	// selecting a piece
	Select(r,c){
		this.selected = true;
		this.rselected = r;
		this.cselected = c;
	}

	// unselecting a piece
	Unselect(r,c){
		this.selected = false;
	}
}


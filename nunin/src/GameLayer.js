var GameLayer = cc.Layer.extend({

    ctor: function(netcode){
        this._super();
        this.netcode = netcode;
        this.init();
    },

    init: function() {
         _this = this;

        this.character = new Character( Math.random()*1500 , 500 );
        this.addChild( this.character );

        //this.character2 = new Enemy( Math.random()*1500 , 500 );
        //this.addChild( this.character2 );

        this.createBlocks();

        this.character.setBlock( this.blocks );
        this.character.scheduleUpdate();

        //this.character2.setBlock( this.blocks );
        //this.character2.setCharacter( this.character );
        //this.character2.scheduleUpdate();

        this.lastStatus = new Array();
        this.enemy = [];

        this.API_key = this.GUID();
        this.character.charID = this.API_key;
        this.initNetcode();

        this.setKeyboardEnabled( true );
        this.scheduleUpdate();
        this.lastUpdate = null;

        return true;
    },

    update: function(){
        this.IOcheckPosition( this.character );
        //Check attack system
        this.enemy.forEach( function( p ){
            if(p.charID == _this.character.charID){
                return;
            }
            if( p.getCombo() > 0 ){
                if(p.lastCombo != p.getCombo()){
                    var comboB = new Combo(p.getCombo(), p.x, p.y);
                    _this.addChild(comboB);
                }
                p.lastCombo = p.getCombo();
            }
            //_this.canBlock(_this.character, p);
            if( _this.checkAttack(_this.character, p) && _this.character.attack && _this.character.canAttack && p.health != 0 && p.delayStatus == 0 ){
                
                _this.character.canAttack = false;
                var can = true;
                if( p.STATUS != 3 ){
                    console.log("Attack style 1");
                    _this.character.addCombo();
                    _this.character.timeLastCombo = new Date();
                    var comboA = new Combo(_this.character.getCombo(), _this.character.x, _this.character.y);
                    _this.addChild(comboA);
                    can = false;
                }else if( !_this.canBlock(_this.character, p) ){
                    console.log("Attack style 2");
                    _this.character.addCombo();
                    _this.character.timeLastCombo = new Date();
                    var comboA = new Combo(_this.character.getCombo(), _this.character.x, _this.character.y);
                    _this.addChild(comboA);
                    can = false;
                }

                var aAttack = {
                    charID: _this.character.charID,
                    X: _this.character.x,
                    combo: _this.character.getCombo(),
                }
                var bAttack = {
                    charID: p.charID,
                    X: p.x,
                    canBlock: can,
                }
                this.netcode.send({command: "input", key: ['attack', aAttack, bAttack]});
            }else{
                //console.log("Miss// "+_this.checkAttack(_this.character, p));
            }
        }, this);
    },

    canBlock: function( character, player){
        var p = player.getBoundingBox();
        var charThis = character.getBoundingBox();
        if( character.isFlippedX() ){            
            var rectAtk = cc.rect(charThis.x - 5, charThis.y, (charThis.width/2) - 17, charThis.height);    
        }else{
            var rectAtk = cc.rect(charThis.x + charThis.width, charThis.y, (charThis.width/2) - 22, charThis.height);    
        }
        if( player.isFlippedX() ){   
            var rectBlock = cc.rect(p.x - 5 , p.y, (p.width/2), p.height);
            //console.log(cc.rectIntersectsRect( character.getBoundingBox() , rectBlock ));
        }else{
            var rectBlock = cc.rect(p.x + p.width, p.y, (p.width/2) - 5, p.height);
            //console.log(cc.rectIntersectsRect( character.getBoundingBox() , rectBlock ));
        }
        return cc.rectIntersectsRect( rectAtk , rectBlock );
    },

    checkAttack: function( character, player ){
        var charThis = character.getBoundingBox();
        if( character.isFlippedX() ){            
            var rectAtk = cc.rect(charThis.x - 5, charThis.y, (charThis.width/2) - 17, charThis.height);    
        }else{
            var rectAtk = cc.rect(charThis.x + charThis.width, charThis.y, (charThis.width/2) - 22, charThis.height);    
        }
        return cc.rectIntersectsRect( player.getBoundingBox() , rectAtk );
        
    },


    S4: function () {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },

    GUID: function() {
        return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
    },

    initNetcode: function(){
        this.onNetData = this.onNetData.bind(this);
        this.netcode.on("data", this.onNetData);
    },

    onNetData: function(data){
        if(data.playerIndex !== undefined){
            this.playerIndex = data.playerIndex;
            this.character.charID = this.playerIndex;
        }
        if(data.hash){
            data.game = data.hash;
        }

        if(data.game){
            data.game.players.forEach(function(player, index){
                if(player[0] == -1){
                    return;
                }
                var enemy = this.enemy[index];
                if(!enemy){
                    enemy = new Player();
                    enemy.charID = index;
                    if(index != this.playerIndex){
                        this.addChild(enemy);
                        enemy.scheduleUpdate();
                    }
                    this.enemy.push(enemy);
                }
                enemy.setStatus(player);
            }, this);
            var player = data.game.players[this.playerIndex];
            if(player && player[0] != -1){
                this.character.x = player[0];
                this.character.y = player[1];
                this.character.setHealth( player[3] );
            }
        }
    },

    cleanup: function(){
        this._super();
        this.netcode.off("data", this.onNetData);
    },

    IOupdateEnemy: function(){
        this.socket.on('newChar', function( Character ) {
            var unique = true;
            _this.enemy.forEach(function( p ){
                if( p.charID == Character.characterID )
                unique = false;
            }, _this );
            if(unique){
                var character2 = new Player( Character.x , Character.y );
                character2.charID = Character.characterID;
                character2.STATUS = Character.status;
                _this.addChild( character2 );
                character2.scheduleUpdate();
                _this.enemy.push(character2);
            }
            
        });

        this.socket.on( 'regis', function( key , client ){
            for( var i=0 ; i < client.length ; i++ ){
                if( key != client[i].characterID && _this.findInEnemy( client[i] ) ){
                    var character2 = new Player( client[i].x , client[i].y );
                    character2.health = client[i].health;
                    _this.addChild(character2);
                    character2.charID = client[i].characterID;
                    character2.scheduleUpdate();
                    _this.number += 1;
                    _this.enemy.push(character2);
                }
            }
        });

        this.socket.on('updateEnermy', function( Player ){
            _this.lastUpdate = Player;
        });

        this.socket.on('disconnect', function( key ){
            for( var i=0;i<_this.enemy.length;i++){
                if(_this.enemy[i].charID == key){
                    _this.removeChild(_this.enemy[i]);
                    _this.enemy.splice(i, 1);
                    break;
                }
            }
        });

    },

    findPlayerServerIndex: function( clientID , server ){
        for(var i=0;i<server.length;i++){
            if(server[i].characterID == clientID)
                return i;
        }
    },

    findInEnemy: function( Player ){
        for (var i = 0 ; i < this.enemy.length ; i++) {
                if( Player.characterID == this.enemy[i].charID ){
                    return false;
                }
        }
        return true;
    },

    IOcheckPosition: function( character ){
        var statusChar = new Array();
        statusChar[0] = character.x;
        statusChar[1] = character.y;
        statusChar[2] = character.STATUS;
        statusChar[3] = character.health;
        statusChar[4] = character.delayStatus;
        statusChar[5] = character.getCombo();
        statusChar[6] = character.isFlippedX();
        if( this.lastStatus[0] != statusChar[0] || this.lastStatus[1] != statusChar[1] || this.lastStatus[2] != statusChar[2] || this.lastStatus[3] != statusChar[3] || this.lastStatus[4] != statusChar[4] || this.lastStatus[5] != statusChar[5] || this.lastStatus[6] != statusChar[6]){
            this.netcode.send({'command': 'input', 'key': statusChar});
            for(var i=0;i<statusChar.length;i++){
                this.lastStatus[i] = statusChar[i];
            }
        }
    },

    createBlocks: function() {
        this.blocks = [];
        var groundBlock = new Block( 0, 0, 1559, 40 );
        this.blocks.push( groundBlock );

        var building1 = new Block( 80, 190, 220, 210 );
        this.blocks.push( building1 );

        var building2 = new Block( 290, 210, 420, 250 );
        this.blocks.push( building2 );

        var building3 = new Block( 510, 250, 630, 280 );
        this.blocks.push( building3 );

        var building3_2 = new Block( 510, 140, 630, 175 );
        this.blocks.push( building3_2 );

        var building4 = new Block( 680, 180, 1150, 220 );
        this.blocks.push( building4 );

        var building5 = new Block( 1280, 180, 1350, 216 );
        this.blocks.push( building5 );

        var building5_2 = new Block( 1280, 290, 1350, 300 );
        this.blocks.push( building5_2 );

        var building6 = new Block( 1420, 190, 1550, 230 );
        this.blocks.push( building6 );

        this.blocks.forEach( function( b ) {
            this.addChild( b );
        }, this );
    },

    onKeyDown: function( e ) {
        this.character.handleKeyDown( e );
    },

    onKeyUp: function( e ) {
        this.character.handleKeyUp( e );
    }
});


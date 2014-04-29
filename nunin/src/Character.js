var Character = cc.Sprite.extend({
    ctor: function( x , y ) {
        this._super();
        this.setAnchorPoint( cc.p( 0.5, 0 ) );
        this.lastX = x;
        this.x = x;
        this.y = y;

        this.maxVx = 3;
        this.accX = 0.25;
        this.backAccX = 0.5;
        this.jumpV = 20;
        this.g = -1;
        
        this.vx = 0;
        this.vy = 0;

        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.attack = false;
        this.blockAttack = false;

        this.ground = null;

        this.blocks = [];

        this.charID = null;
        this.health = 1000;
        this.lastHealth = this.health;

        this.updatePosition();
        this.createAnimation();

        this.STATUS = Character.STATUS.STILL;
        this.lastSTATUS = null;
        this.delayStatus = 0;
        this.canAttack = true;
        this.timeLastCombo = 0;

        this.createHealthBar();

    },

    createAnimation: function(){
        this.Action = new Array();
        this.Action[0] = this.charAnimation( "dead" , 3 );
        this.Action[1] = this.charAnimation( "still" , 6 );
        this.Action[2] = this.charAnimation( "damage" , 2 );
        this.Action[3] = this.charAnimation( "block", 1);
        this.Action[4] = this.charAnimation( "run" , 6 );
        this.Action[5] = this.charAnimation( "run" , 6 );
        this.Action[6] = this.charAnimation( "jumpup" , 2 );
        this.Action[7] = this.charAnimation( "jumpdown" , 2 );
        this.Action[8] = this.charAnimation( "attack" , 4 );
        this.Action[9] = this.charAnimation( "attackB" , 4 );
        this.Action[10] = this.charAnimation( "attackC" , 4 );
    },
    
    updatePosition: function() {
        this.setPosition( cc.p( this.x, this.y ) );
    },

    update: function() {
        
        if( this.health > 0 || !this.ground ){

            var oldRect = this.getBoundingBoxToWorld();
            var oldX = this.x;
            var oldY = this.y;
            this.updateYMovement();
            this.updateXMovement();
        
            var dX = this.x - oldX;
            var dY = this.y - oldY;
        
            var newRect = cc.rect( oldRect.x + dX, oldRect.y + dY - 1, oldRect.width, oldRect.height + 1 );

            this.handleCollision( oldRect, newRect );
        
            this.updatePosition();
            this.updateCombo();
        }
        //===================== Check Animation ===========================
        this.updateAnimation(); 
        //===================== Check Animation ===========================
        this.updateHealthBar();

    },
    // For skill and special attack
    checkAttack: function(){
        if( this.keyA && !this.keyB && !this.keyC ){
            this.attack = true;
        }else if( !this.keyA && this.keyB && !this.keyC ){
            this.blockAttack = true;
        }else if( !this.keyA && !this.keyB && !this.keyC ){
            this.attack = false;
            this.blockAttack = false;
        }
    },

    setHealth: function( health ){
        this.health = health;
    },

    updateAnimation: function(){
        var audioEngine = cc.AudioEngine.getInstance();

        if( this.delayStatus == 0 ){
            //this.checkAttack();
            if( !this.ground ){ // In the air
                this.canAttack = false;
                if( this.vy <= 0 ){
                    this.STATUS = Character.STATUS.JUMPDOWN;
                }else{
                    this.delayStatus = 20;

                    if( Math.random() > 0.5){
                        audioEngine.playEffect(s_music_jump[0]);
                    }else{
                        audioEngine.playEffect(s_music_jump[1]);
                    }

                    this.STATUS = Character.STATUS.JUMPUP;
                }
            }else{ // on the ground
                if( this.health <= 0 ){
                    this.canAttack = false;
                    this.delayStatus = -1;
                    this.STATUS = Character.STATUS.DEAD;

                    audioEngine.playEffect(s_music_dead);

                }else if( this.lastHealth != this.health ){
                    this.canAttack = false;
                    this.delayStatus = 26;
                    this.lastHealth = this.health;
                    this.STATUS = Character.STATUS.DAMAGE;

                    var random = Math.random();
                    if( random < 0.3){
                        audioEngine.playEffect(s_music_damage[0]);
                    }else if( random < 0.6 ){
                        audioEngine.playEffect(s_music_damage[1]);
                    }else{
                        audioEngine.playEffect(s_music_damage[2]);
                    }

                }else if( this.blockAttack ){
                    this.canAttack = false;
                    this.STATUS = Character.STATUS.BLOCK;
                }else if( this.attack && Character.COMBO == 0 ){
                    this.canAttack = true;
                    this.delayStatus = 30;
                    this.STATUS = Character.STATUS.ATTACKA;
                    if( Math.random() > 0.5){
                        audioEngine.playEffect(s_music_attack[0]);
                    }else{
                        audioEngine.playEffect(s_music_attack[1]);
                    }
                }else if( this.attack && Character.COMBO == 1 ){
                    this.canAttack = true;
                    this.delayStatus = 30;
                    this.STATUS = Character.STATUS.ATTACKB;
                    if( Math.random() > 0.5){
                        audioEngine.playEffect(s_music_attack[0]);
                    }else{
                        audioEngine.playEffect(s_music_attack[1]);
                    }
                }else if( this.attack && Character.COMBO >= 2 ){
                    this.canAttack = true;
                    this.delayStatus = 30;
                    this.STATUS = Character.STATUS.ATTACKC;
                    if( Math.random() > 0.5){
                        audioEngine.playEffect(s_music_attack[0]);
                    }else{
                        audioEngine.playEffect(s_music_attack[1]);
                    }
                }else if( this.vx < 0 ){
                    this.STATUS = Character.STATUS.RUNLEFT;
                }else if( this.vx > 0 ){
                    this.STATUS = Character.STATUS.RUNRIGHT;
                }else{
                    this.STATUS = Character.STATUS.STILL;
                }
            }
            if(this.STATUS == Character.STATUS.DAMAGE || this.STATUS == Character.STATUS.DEAD || this.STATUS == Character.STATUS.BLOCK){
                if(this.vy > 0){
                    this.setFlippedX(false);
                }else if(this.lastX < this.x){
                    this.setFlippedX(true);
                }
            }else{
                if(this.lastX < this.x){
                    this.setFlippedX(false);
                }else if(this.lastX > this.x){
                    this.setFlippedX(true);
                }
            }
        }else if(this.delayStatus != -1 ){
            this.delayStatus--;
        }
        this.lastX = this.x;
        //if( this.attack ){
            //this.stopAllActions();
        //}else{
            if( this.lastSTATUS != this.STATUS ){
                this.lastSTATUS = this.STATUS;
                this.stopAllActions();
                this.runAction(this.Action[this.STATUS]);
            }else{
                if(this.Action[this.lastSTATUS].isDone() && this.STATUS != Character.STATUS.DEAD ){
                    this.runAction(this.Action[this.STATUS]);    
                }
            }
        //}
    },

    handleKeyDown: function( e ) {
        if ( Character.KEYMAP[ e ] != undefined ) {
            this[ Character.KEYMAP[ e ] ] = true;
        }
    },

    handleKeyUp: function( e ) {
        if ( Character.KEYMAP[ e ] != undefined ) {
            this[ Character.KEYMAP[ e ] ] = false;
        }
    },

    updateXMovement: function() {
        if ( this.ground ) {
            if ( this.delayStatus == 0 && !this.blockAttack){
                if ( ( !this.moveLeft ) && ( !this.moveRight ) ) {
                    this.autoDeaccelerateX();
                } else if ( this.moveRight ) {
                    this.accelerateX( 1 );
                } else if ( this.moveLeft ){
                    this.accelerateX( -1 );
                }
            }else{
                this.autoDeaccelerateX();
            }
        }
        this.x += this.vx;
        if ( this.x < 0 ) {
            this.x -= this.vx;
        }
        if ( this.x > 1559 ) {
            this.x -= this.vx;
        }
    },

    updateYMovement: function() {
        if ( this.ground ) {
            this.vy = 0;
            if ( this.jump ) {
                this.vy = this.jumpV;
                this.y = this.ground.getTopY() + this.vy;
                this.ground = null;
            }
        } else {
            this.vy += this.g;
            this.y += this.vy;
        }
    },

    isSameDirection: function( dir ) {
        return ( ( ( this.vx >=0 ) && ( dir >= 0 ) ) ||
                 ( ( this.vx <= 0 ) && ( dir <= 0 ) ) );
    },

    accelerateX: function( dir ) {
        if ( this.isSameDirection( dir ) ) {
            this.vx += dir * this.accX;
            if ( Math.abs( this.vx ) > this.maxVx ) {
                this.vx = dir * this.maxVx;
            }
        } else {
            if ( Math.abs( this.vx ) >= this.backAccX ) {
                this.vx += dir * this.backAccX;
            } else {
                this.vx = 0;
            }
        }
    },
    
    autoDeaccelerateX: function() {
        if ( Math.abs( this.vx ) < this.accX ) {
            this.vx = 0;
        } else if ( this.vx > 0 ) {
            this.vx -= this.accX;
        } else {
            this.vx += this.accX;
        }
    },

    handleCollision: function( oldRect, newRect ) {
        if ( this.ground ) {
            if ( !this.ground.onTop( newRect ) ) {
                this.ground = null;
            }
        } else {
            if ( this.vy <= 0 ) {
                var topBlock = this.findTopBlock( this.blocks, oldRect, newRect );
                
                if ( topBlock ) {
                    this.ground = topBlock;
                    this.y = topBlock.getTopY();
                    this.vy = 0;
                }
            }
        }
    },

    findTopBlock: function( blocks, oldRect, newRect ) {
        var topBlock = null;
        var topBlockY = -1;
        blocks.forEach( function( b ) {
            if ( b.hitTop( oldRect, newRect ) ) {
                if ( b.getTopY() > topBlockY ) {
                    topBlockY = b.getTopY();
                    topBlock = b;
                }
            }
        }, this );
        
        return topBlock;
    },

    setBlock: function ( blocks ){
        this.blocks = blocks;
    },

    charAnimation: function( Action , num ){
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames( s_naruto[0] , s_naruto[1] );

        var animFrames = [];
        for (var i = 0; i < num; i++) {
            var str = Action + i + ".png";
            var frame = cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.1);
        return cc.Animate.create(animation);
    },

    createHealthBar: function(){
        var bgBar = new cc.Sprite.create(s_healthbar);
        bgBar.setPosition( cc.p(0, 80));
        bgBar.setAnchorPoint( cc.p( 0, 0.5 ) );
        this.addChild(bgBar);

        var bar = new cc.Sprite();
        bar.setAnchorPoint( cc.p( 0, 0.5 ) );
        bar.setPosition( cc.p(1, 80));
        this.addChild(bar, 2, "Blood");
    },

    updateHealthBar: function(){   
        var bar = this.getChildByTag("Blood");
        if(this.health > 500){  
            bar.setColor( new cc.Color4B( 0, 222, 0, 255) );
        }else if(this.health > 200){
            bar.setColor( new cc.Color4B( 239, 198, 0, 255) );
        }else{
            bar.setColor( new cc.Color4B( 231, 16, 16, 255) );
        }
        bar.setTextureRect( cc.rect(1, 80, (this.health / 1000)*59, 3) );
    },

    addCombo: function(){
        Character.COMBO++;
    },

    getCombo: function(){
        return Character.COMBO;
    },

    updateCombo: function(){
        var Combo = new Date();
        if ( Combo - this.timeLastCombo > 1000 ){
            Character.COMBO = 0;
        }
    },
});
Character.STATUS ={
    DEAD: 0,
    STILL: 1,
    DAMAGE: 2,
    BLOCK: 3,
    RUNLEFT: 4,
    RUNRIGHT: 5,
    JUMPUP: 6,
    JUMPDOWN: 7,
    ATTACKA: 8,
    ATTACKB: 9,
    ATTACKC: 10,
};
Character.KEYMAP = {};
Character.KEYMAP[cc.KEY.left] = 'moveLeft';
Character.KEYMAP[cc.KEY.right] = 'moveRight';
Character.KEYMAP[cc.KEY.v] = 'jump';
Character.KEYMAP[cc.KEY.c] = 'attack';
Character.KEYMAP[cc.KEY.x] = 'blockAttack';
Character.KEYMAP[cc.KEY.z] = 'attack_2';
Character.COMBO = 0;
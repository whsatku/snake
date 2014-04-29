var Enemy = cc.Sprite.extend({
    ctor: function( x , y ) {
        this._super();
        this.setAnchorPoint( cc.p( 0.5, 0 ) );
        this.originX = x;
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

        this.ground = null;

        this.blocks = [];

        this.updatePosition();

        this.Action = new Array();
        this.Action[0] = this.charAnimation( "still" , 6 );
        this.Action[1] = this.charAnimation( "run" , 6 );
        this.Action[2] = this.charAnimation( "run" , 6 );
        this.Action[3] = this.charAnimation( "jumpup" , 2 );
        this.Action[4] = this.charAnimation( "jumpdown" , 2 );
        this.Action[5] = this.charAnimation( "attack" , 4 );

        this.STATUS = Enemy.STATUS.STILL;
        this.lastSTATUS = null;

        this.character = null;

        this.charID = null;
        
        this.attack = false;
        this.socket = null;
        //===================================== For AI ===============================================
        this.timeCount = -1;
        this.lastPositionOfCharacter = new Array();
        //===================================== For AI ===============================================
        
    },

    updatePosition: function() {
        this.setPosition( cc.p( this.x, this.y ) );
    },

    setCharacter: function( character ){
        this.character = character;
    },
    update: function() {
        //================================== AI =======================================
        var random = Math.random(); 
        if( this.timeCount < 0 ){
            if( this.x >= this.character.x - 20 && this.x <= this.character.x + 20 && this.y == this.character.y ){
                this.timeCount = -1;
                this.moveLeft = false;
                this.moveRight = false;
                this.jump = false;
            }else if( this.x >= this.character.x - 200 && this.x <= this.character.x + 200 && this.y < this.character.y ){
                this.jump = true;
                this.timeCount = 10;
            }else if( this.x > this.character.x ){
                this.moveLeft = true;
                this.timeCount = 20;
            }else if( this.x <= this.character.x ){
                this.moveRight = true;
                this.timeCount = 20;
            }
        }else if(this.timeCount == 0){
            this.timeCount = -1;
            this.moveLeft = false;
            this.moveRight = false;
            this.jump = false;
        }else{
            this.timeCount -= 1;
        }
        //================================== AI =======================================

        var oldRect = this.getBoundingBoxToWorld();
        var oldX = this.x;
        var oldY = this.y;
        this.updateYMovement();
        this.updateXMovement();
        
        var dX = this.x - oldX;
        var dY = this.y - oldY;
        
        var newRect = cc.rect( oldRect.x + dX,
                               oldRect.y + dY - 1,
                               oldRect.width,
                               oldRect.height + 1 );

        this.handleCollision( oldRect, newRect );
        this.updatePosition();
        //===================== Check Animation ===========================

        if( this.ground == null ){ // In the air
            if( this.vy <= 0 ){
                this.STATUS = Enemy.STATUS.JUMPDOWN;
            }else{
                this.STATUS = Enemy.STATUS.JUMPUP;
            }
        }else{ // on the ground
            if(this.attack || !this.Action[5].isDone()){
                this.STATUS = Enemy.STATUS.ATTACK;
            }else if( this.vx < 0 ){
                this.setFlippedX(true);
                this.STATUS = Enemy.STATUS.RUNLEFT;
            }else if(this.vx > 0){
                this.setFlippedX(false);
                this.STATUS = Enemy.STATUS.RUNRIGHT;
            }else{
                this.STATUS = Enemy.STATUS.STILL;
            }
        }
        if( this.lastSTATUS != this.STATUS ){
            this.lastSTATUS = this.STATUS;
            this.stopAllActions();
            this.runAction(this.Action[this.STATUS]);
        }else{
            if(this.Action[this.lastSTATUS].isDone()){
                this.runAction(this.Action[this.STATUS]);    
            }
        }
        //===================== Check Animation ===========================
    },

    handleKeyDown: function( e ) {
        if ( Enemy.KEYMAP[ e ] != undefined ) {
            this[ Enemy.KEYMAP[ e ] ] = true;
        }
    },

    handleKeyUp: function( e ) {
        if ( Enemy.KEYMAP[ e ] != undefined ) {
            this[ Enemy.KEYMAP[ e ] ] = false;
        }
    },

    updateXMovement: function() {
        if ( this.ground ) {
            if ( ( !this.moveLeft ) && ( !this.moveRight ) ) {
                this.autoDeaccelerateX();
            } else if ( this.attack ){
                if( this.moveRight )
                    this.accelerateX( 0.005 );
                else
                    this.accelerateX( -0.005 );
            } else if ( this.moveRight ) {
                this.accelerateX( 1 );
            } else {
                this.accelerateX( -1 );
            }
        }

        this.x += this.vx;
        if ( this.x <= 0 ) {
            this.x -= this.vx;
        }
        if ( this.x >= 1559 ) {
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
    }
});
Enemy.STATUS ={
    STILL: 0,
    RUNLEFT: 1,
    RUNRIGHT: 2,
    JUMPUP: 3,
    JUMPDOWN: 4,
    ATTACK: 5,
};
Enemy.KEYMAP = {};
Enemy.KEYMAP[cc.KEY.left] = 'moveLeft';
Enemy.KEYMAP[cc.KEY.right] = 'moveRight';
Enemy.KEYMAP[cc.KEY.up] = 'jump';
Enemy.KEYMAP[cc.KEY.a] = 'attack';
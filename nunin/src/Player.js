var Player = cc.Sprite.extend({
    ctor: function( x , y ) {
        this._super();
        this.setAnchorPoint( cc.p( 0.5, 0 ) );
        this.x = x;
        this.y = y;

        this.updatePosition();

        this.createAnimation();

        this.STATUS = Player.STATUS.STILL;

        this.charID = null;
        this.health = 1000;
        this.lastHealth = this.health;
        
        this.attack = false;
        this.delayStatus = 0;

        this.combo = 0;
        this.lastCombo = this.combo;

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

    setStatus: function( stauts ){
        this.x = stauts[0];
        this.y = stauts[1];
        this.STATUS = stauts[2];
        this.health = stauts[3];
        this.delayStatus = stauts[4];
        this.combo = stauts[5];
        this.setFlippedX(stauts[6]);
    },
    update: function() {
        if( this.health > 0 ){
            this.updatePosition();
        }
        this.updateHealthBar();

        if(this.combo == 0 ){
            this.lastCombo = 0;
        }

        if( this.lastSTATUS != this.STATUS ){
            this.lastSTATUS = this.STATUS;
            this.stopAllActions();
            this.runAction(this.Action[this.STATUS]);
        }else{
            if(this.Action[this.STATUS].isDone() && this.STATUS != Player.STATUS.DEAD ){
                this.runAction(this.Action[this.STATUS]);    
            }
        }
        

        //===================== Check Animation ===========================
    },

    getCombo: function(){
        return this.combo;
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
Player.STATUS ={
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
var Combo = cc.Sprite.extend({
    ctor: function( num, x, y ) {
    	this._super();

        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        this.setPosition( cc.p(x+(Math.random()*(-50)), y+(Math.random()*5*plusOrMinus)) );
    	this.numPos = new Array();

        this.setAnchorPoint( cc.p( 0 , 0 ) );
        
        this.numCombo = num;
        this.textIn = this.numCombo+"x";
        this.createSprite();

        this.Time = 50;

        var actionBy = cc.MoveTo.create(1, cc.p(x-(10*plusOrMinus), y+(Math.random()*50)));   
        this.runAction(actionBy);

        this.scheduleUpdate();    
        
    },

    update: function(){
        
        if(this.Time > 0){
            if(this.Time == 5){
                this.createFade();
            }
            this.Time--;    
        }else{
            this.removeFromParent();
        }
    },

    createSprite: function(){
    	for( var i = 0; i < this.textIn.length; i++ ){
    		num = this.addSprite( this.textIn.substring( i , i+1 ) );
    		num.setAnchorPoint( cc.p( 0, 0 ) );
    		num.setPosition( cc.p( ( (i + 1 )*18 ) - 20 , 90 ) );
    		this.numPos.push( num );
    		this.addChild( num , i );
    	}
    },

    createFade: function(){
        for( var i = 0; i < this.numPos.length; i++ ){
            this.numPos[i].runAction(cc.FadeOut.create(1.0));
        }
    },

    addSprite: function( number ){
    	var num = cc.Sprite.create( 'img/'+number+'.png' );
    	num.setAnchorPoint( cc.p( 0, 0 ) );
        num.setOpacity(255);
    	return num;
    }
});
var waitScreen = cc.Layer.extend({

	init: function( ){

		this.cartoon = new Array();
		this.cartoon[0] = this.cartoonAction("cartoon0",7);
		this.cartoon[1] = this.cartoonAction("cartoon1",6);
		this.cartoon[2] = this.cartoonAction("cartoon2",7);
		this.cartoon[3] = this.cartoonAction("cartoon3",5);
		this.cartoon[4] = this.cartoonAction("cartoon4",6);
		this.cartoon[5] = this.cartoonAction("cartoon5",6);
		this.cartoon[6] = this.cartoonAction("cartoon6",5);
		this.time = new Array();
		this.time[0] = 20;
		this.time[1] = false;
		
		this.connectingServer();
		this.scheduleUpdate();

		return true;
	},
	setTime: function( boo ){
		this.time[1] = boo;
	},

	update: function(){
		if( this.textField.getString() == "Conneting to server . . . " && this.time[0] == 0 && !this.time[1] ){
			this.textField.setString("Conneting to server");
			this.time[0] = 20;
		}else if( this.textField.getString() == "Conneting to server . . " && this.time[0] == 0 && !this.time[1] ){
			this.textField.setString("Conneting to server . . . ");	
			this.time[0] = 20;
		}else if( this.textField.getString() == "Conneting to server . " && this.time[0] == 0 && !this.time[1] ){
			this.textField.setString("Conneting to server . . ");	
			this.time[0] = 20;
		}else if( this.textField.getString() == "Conneting to server" && this.time[0] == 0 && !this.time[1] ){
			this.textField.setString("Conneting to server . ");	
			this.time[0] = 20;
		}else if( this.time[1] ){
			this.textField.setColor( cc.RED );
			this.textField.setString("Failed to connect to server ;( \nPlease try again later.");
			this.textField.setPosition( this.textField.getPosition().x , screenHeight/2 - 75 )
		}
		this.time[0] -= 1;		
		
	},

	loadingAction: function(){
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames( s_loading[0] , s_loading[1] );

        var animFrames = [];
        for (var i = 0; i < 12; i++) {
            var str = "load" + i + ".png";
            var frame = cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.2);
        return cc.RepeatForever.create(cc.Animate.create(animation));
    },
    cartoonAction: function( name , num ){
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames( s_cartoon[0] , s_cartoon[1] );

        var animFrames = [];
        for (var i = 0; i < num; i++) {
            var str = name + i + ".png";
            var frame = cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, Math.random()*2);
        return cc.RepeatForever.create(cc.Animate.create(animation));
    },

    connectingServer: function(){
        if(!black){

            var loadingAm = new cc.Sprite();
            loadingAm.runAction( this.loadingAction() );
            loadingAm.setAnchorPoint( cc.p( 0, 0));
            loadingAm.setPosition( cc.p( screenWidth/2 - 95 ,screenHeight/2 - 57 ));
            this.addChild(loadingAm,4);

            for(var i=0;i<7;i++){
            	var cartoon = new cc.Sprite();
            	cartoon.runAction( this.cartoon[i] );
            	cartoon.setAnchorPoint( cc.p( 0, 0));
            	cartoon.setScale(1.2);
            	cartoon.setPosition( cc.p( screenWidth/2 - 180 + (i*50) ,screenHeight/2 - 27 ));
            	this.addChild(cartoon,5);
        	}

            this.textField = cc.LabelTTF.create("Conneting to server . . . ", "Arial", 13);
            this.textField.setAnchorPoint( cc.p( 0, 0));
            this.textField.setPosition( cc.p( screenWidth/2 - 70 ,screenHeight/2 -58));
            this.textField.setColor( cc.WHITE );

            this._logoLayer = cc.Sprite.create(s_logo);
            this._logoLayer.setPosition(cc.p( 500, 365 ));
            this._logoLayer.setScale( 0.5 , 0.5 );
            this.addChild(this._logoLayer, 5);

        
            var black = new cc.Sprite();
            black.setAnchorPoint( cc.p( 0, 0));
            black.setTextureRect(cc.rect( 0, 0, screenWidth, screenHeight));
            black.setColor( cc.BLACK );
            black.setOpacity(200);
            

            this.runAction(cc.Follow.create(black, cc.rect(0, 0, 1555, 600)));
            this.addChild(black,2);
            this.addChild(this.textField,300);
        }
    },
    changeText: function( message ){
    	this.textField.setString( message );
    },
});
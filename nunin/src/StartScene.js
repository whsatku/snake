var StartScene = cc.Scene.extend({
    ctor:function (settings, netcode) {
        this._super();
        this.netcode = netcode;

        this.addChild(new BackgroundLayer(), 0, TagOfLayer.BackgroundLayer);
        this.addChild(new GameLayer(this.netcode), 0, TagOfLayer.GameLayer);        
        this.addChild(new EffectLayer(), 0, TagOfLayer.EffectLayer);

        this.follow();
        this.scheduleUpdate();
        this.init();
    },

    init: function(){
        this.firstConnected = true;

        //Add audio background
        var audioEngine = cc.AudioEngine.getInstance();
        audioEngine.preloadEffect(s_music_jump[0]);
        audioEngine.preloadEffect(s_music_jump[1]);
        audioEngine.preloadEffect(s_music_attack[0]);
        audioEngine.preloadEffect(s_music_attack[1]);
        audioEngine.preloadEffect(s_music_damage[0]);
        audioEngine.preloadEffect(s_music_damage[1]);
        audioEngine.preloadEffect(s_music_damage[2]);
        audioEngine.preloadEffect(s_music_dead);

        audioEngine.setEffectsVolume(0.2);
        audioEngine.setMusicVolume(0.2);
        audioEngine.playMusic(s_music_bg, true);
    },

    reconnect:function(){
    	var gameLayer = this.getChildByTag(TagOfLayer.GameLayer);
    	var backgroundLayer = this.getChildByTag(TagOfLayer.BackgroundLayer);

        if(this.firstConnected){
            this.firstConnected = false;
            gameLayer.setKeyboardEnabled( true );
            backgroundLayer.runAction(cc.Follow.create(gameLayer.character, cc.rect(0, 0, 1555, 600)));
           this.netcode.send({command: "ready"});
        }
    },

    follow: function(){
    	var gameLayer = this.getChildByTag(TagOfLayer.GameLayer);
    	gameLayer.runAction( cc.Follow.create(gameLayer.character, cc.rect(0, 0, 1555, 600)) );
    },

    update: function(){
    	this.reconnect();
    }

});
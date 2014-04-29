var MenuLayer = cc.Layer.extend({
    ctor : function(){
        this._super();

    },
    init:function(){
        this._super();

        this.setTouchEnabled(true);
        this.setTouchMode(1);

        var director = cc.Director.getInstance();
        var winsize = director.getWinSize();
        var centerpos = cc.p(winsize.width / 2, winsize.height / 2);

        var bg = cc.Sprite.create(s_menu_bg);
        bg.setPosition(centerpos);

        this.addChild(bg);

        var logo = cc.Sprite.create(s_logo);
        logo.setPosition(cc.p(850,90));
        logo.setScale(0.7,0.7);
        this.addChild(logo, 1);

        var textField = cc.LabelTTF.create("Click TO START ... ", "electroharmonix", 35);
        textField.setAnchorPoint( cc.p( 0.5, 0.5));
        textField.setPosition( cc.p( screenWidth/2, 50));
        textField.setColor( cc.WHITE );
        textField.setOpacity(0);
        textField.enableStroke(cc.c4b(238,37,37,255),3,true);

        var fadeIn = cc.FadeIn.create(1.0);
        var fadeOut = cc.FadeOut.create(1.0);
        var delay = cc.DelayTime.create(0.5);
        textField.runAction(cc.RepeatForever.create(cc.Sequence.create(fadeIn, delay, fadeOut)));
        this.addChild(textField,300);
    },
    onTouchBegan:function(touch, event) {
        this.onPlay();
    },

    onPlay : function(){
        var director = cc.Director.getInstance();
        director.replaceScene(cc.TransitionFade.create(1.5, new StartScene()));
    }
});
var menuScene = cc.Scene.extend({
	 ctor:function () {
        this._super();
        var layer = new MenuLayer();
        layer.init();
        this.addChild(layer);
    }
});
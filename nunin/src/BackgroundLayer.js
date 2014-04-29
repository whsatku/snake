var BackgroundLayer = cc.Layer.extend({
  ctor: function(){
    this._super();
    this.init();
	},

	init: function() {
    var Background = cc.Sprite.create('img/Background.png');
    Background.setAnchorPoint(cc.p(0.0,0.0));
    Background.setPosition(cc.p(0,0));
    this.addChild(Background,0);
	}
});

/* globals cc, GameScene */
(function(){
/* jshint unused:false */
"use strict";
var Cocos2dApp = cc.Application.extend({
	config: document.ccConfig,
	ready: false,

	ctor: function(scene) {
		this._super();
		this.startScene = scene;
		cc.COCOS2D_DEBUG = this.config.COCOS2D_DEBUG;
		cc.initDebugSetting();
		cc.setup(this.config.tag);
		cc.AppController.shareAppController().didFinishLaunchingWithOptions();
	},

	applicationDidFinishLaunching: function() {
		// initialize director
		var director = cc.Director.getInstance();

		//cc.EGLView.getInstance()._adjustSizeToBrowser();

		// turn on display FPS
		director.setDisplayStats(this.config.showFPS);

		// set FPS. the default value is 1.0/60 if you don"t call this
		director.setAnimationInterval(1.0/this.config.frameRate);

		cc.LoaderScene.preload(this.config.resourceFiles, this.onLoaded, this);

		return true;
	},

	onLoaded: function(){
		this.ready = true;
		// TODO: Make this dispatch event
	},

	startGame: function(args){
		if(!this.ready){
			console.error("startGame call before game was loaded");
			return;
		}
		cc.Director.getInstance().replaceScene(new this.startScene(args));
	}
});

window.game = new Cocos2dApp(GameScene);
})();
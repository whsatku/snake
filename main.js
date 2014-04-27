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
		cc.setup(this.config.tag, 800, 600);

		this.emptyScene = cc.Scene.create();
		this.event = new GameLogic.event();

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
		var director = cc.Director.getInstance();
		director.replaceScene(this.emptyScene);
		director.pause();
		this.event.emit("loaded");
	},

	startGame: function(args, netcode){
		if(!this.ready){
			this.event.once("loaded", this.startGame.bind(this, args, netcode));
			return;
		}
		var director = cc.Director.getInstance();
		director.resume();
		director.replaceScene(new this.startScene(args, netcode));
		this.event.emit("gameStart");
	},

	endGame: function(data){
		var director = cc.Director.getInstance();
		director.replaceScene(this.emptyScene);
		director.pause();
		this.event.emit("gameEnd", data);
	}
});

window.game = new Cocos2dApp(GameScene);
})();
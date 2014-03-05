/* global cc */
/* jshint unused:false */
"use strict";

window.GameScene = cc.Scene.extend({
	onEnter: function() {
		this._super();

		var mainLayer = new GameMainLayer();
		mainLayer.init();
		this.addChild(mainLayer);
	},
});
/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.WorldObjectNode = cc.Sprite.extend({
	color: cc.c3b(0, 0, 0),

	init: function(){
		this._super();
		this.setAnchorPoint(0, 1);

		var scene = this.getScene();
		this.setContentSize(scene.gridSize[0], scene.gridSize[1]);
		this.setColor(this.color);
	},

	syncFromEngine: function(obj){
		this.setPosition(this.getParent().toUIPosition(obj.x, obj.y));
	},

	getScene: function(){
		if(this._scene){
			return this._scene;
		}

		var search = this.getParent();
		while(!(search instanceof GameScene)){
			search = search.getParent();
		}
		this._scene = search;
		return search;
	}
});
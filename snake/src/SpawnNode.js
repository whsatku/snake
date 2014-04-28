/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SpawnNode = WorldObjectNode.extend({
	init: function(){
		this._super("res/halo.png");
	},
	syncFromEngine: function(obj){
		this._super(obj);

		if(obj.owner === this.getRoot().game.player){
			if(!this.arrow){
				this._createArrow();
			}
			var bb = this.getBoundingBox();
			this.arrow.setPosition(bb.x - 5, bb.y + 15);
		}
	},
	cleanup: function(){
		this._super();
		if(this.arrow){
			this.getRoot().removeChild(this.arrow);
		}
	},

	_createArrow: function(){
		this.arrow = cc.Sprite.create("res/down.png");
		this.arrow.setAnchorPoint(0, 0);
		this.getRoot().addChild(this.arrow, 10);
	}
});
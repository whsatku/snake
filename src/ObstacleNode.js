/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.ObstacleNode = cc.Sprite.extend({
	init: function(){
		this._super();
		this.setAnchorPoint(0, 1);

		var parent = this.getParent();
		this.setContentSize(parent.gridSize[0], parent.gridSize[1]);
		this.setColor(cc.c3b(0, 0, 0));
	}
});